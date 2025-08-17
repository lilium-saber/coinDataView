package ethgo

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"math/big"
	"net/http"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

type EthClient struct {
	client *ethclient.Client
}

type BalanceInfo struct {
	Address    string `json:"address"`
	BalanceWei string `json:"balance_wei"`
	BalanceEth string `json:"balance_eth"`
}

type TokenInfo struct {
	Address    string `json:"address"`
	Symbol     string `json:"symbol"`
	Name       string `json:"name"`
	Decimals   uint8  `json:"decimals"`
	Balance    string `json:"balance"`
	BalanceRaw string `json:"balance_raw"`
}

type WalletAssets struct {
	Address     string                `json:"address"`
	EthBalance  *BalanceInfo          `json:"eth_balance"`
	Tokens      map[string]*TokenInfo `json:"tokens"`
	TotalTokens int                   `json:"total_tokens"`
}

type EtherscanTokenTx struct {
	Result []struct {
		ContractAddress string `json:"contractAddress"`
		TokenSymbol     string `json:"tokenSymbol"`
		TokenName       string `json:"tokenName"`
		TokenDecimal    string `json:"tokenDecimal"`
	} `json:"result"`
}

const erc20ABI = `[
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    }
]`

var PopularTokens = []string{
	"0x6B175474E89094C44Da98b954EedeAC495271d0F",  // DAI
	"0x2f5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5", // TON
	"0xdAC17F958D2ee523a2206206994597C13D831ec7",  // USDT
	"0xA0b86a33E6441E5e5D9c8d5d8b0b8b0b8b0b8b0b",  // USDC
	"0x6B175474E89094C44Da98b954EedeAC495271d0F",  // DAI
	"0x514910771AF9Ca656af840dff83E8264EcF986CA",  // LINK
	"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",  // UNI
	"0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",  // MATIC
	"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  // WETH
	"0xbA2aE424d960c26247fA25b2e5D0B5B5B5B5B5B5",  // Doge
}

func NewEthClient(rpcURL string) (*EthClient, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("connect to Ethereum node failed: %v", err)
	}

	return &EthClient{
		client: client,
	}, nil
}

func weiToEth(weiAmount *big.Int) string {
	ethValue := new(big.Float)
	ethValue.SetInt(weiAmount)

	divisor := new(big.Float)
	divisor.SetFloat64(1e18)

	ethValue.Quo(ethValue, divisor)
	return ethValue.Text('f', 18)
}

func (ec *EthClient) callContract(contractAddr common.Address, contractABI abi.ABI, method string) ([]interface{}, error) {
	data, err := contractABI.Pack(method)
	if err != nil {
		return nil, err
	}

	result, err := ec.client.CallContract(context.Background(), ethereum.CallMsg{
		To:   &contractAddr,
		Data: data,
	}, nil)
	if err != nil {
		return nil, err
	}

	return contractABI.Unpack(method, result)
}

func (ec *EthClient) callContractWithParams(contractAddr common.Address, contractABI abi.ABI, method string, params ...interface{}) ([]interface{}, error) {
	data, err := contractABI.Pack(method, params...)
	if err != nil {
		return nil, err
	}

	result, err := ec.client.CallContract(context.Background(), ethereum.CallMsg{
		To:   &contractAddr,
		Data: data,
	}, nil)
	if err != nil {
		return nil, err
	}

	return contractABI.Unpack(method, result)
}

func convertTokenBalance(balance *big.Int, decimals uint8) string {
	if decimals == 0 {
		return balance.String()
	}

	balanceFloat := new(big.Float)
	balanceFloat.SetInt(balance)

	divisor := new(big.Float)
	divisor.SetFloat64(math.Pow(10, float64(decimals)))

	balanceFloat.Quo(balanceFloat, divisor)
	return balanceFloat.Text('f', int(decimals))
}

func (ec *EthClient) getTokenAddressesFromEtherscan(walletAddress, apiKey string) ([]string, error) {
	url := fmt.Sprintf(
		"https://api.etherscan.io/api?module=account&action=tokentx&address=%s&startblock=0&endblock=999999999&sort=asc&apikey=%s",
		walletAddress, apiKey,
	)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to query Etherscan: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var etherscanResp EtherscanTokenTx
	if err := json.Unmarshal(body, &etherscanResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	// 去重代币地址
	tokenSet := make(map[string]bool)
	for _, tx := range etherscanResp.Result {
		tokenSet[tx.ContractAddress] = true
	}

	var tokenAddresses []string
	for addr := range tokenSet {
		tokenAddresses = append(tokenAddresses, addr)
	}

	return tokenAddresses, nil
}

func (ec *EthClient) GetBalance(address string) (*BalanceInfo, error) {
	if !common.IsHexAddress(address) {
		return nil, fmt.Errorf("invalid Ethereum address: %s", address)
	}

	addr := common.HexToAddress(address)
	balance, err := ec.client.BalanceAt(context.Background(), addr, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to query balance: %v", err)
	}
	balanceEth := weiToEth(balance)
	return &BalanceInfo{
		Address:    address,
		BalanceWei: balance.String(),
		BalanceEth: balanceEth,
	}, nil
}

func (ec *EthClient) Close() {
	if ec.client != nil {
		ec.client.Close()
	}
}

func (ec *EthClient) GetTokenBalance(walletAddress, tokenAddress string) (*TokenInfo, error) {
	if !common.IsHexAddress(walletAddress) {
		return nil, fmt.Errorf("invalid wallet address: %s", walletAddress)
	}
	if !common.IsHexAddress(tokenAddress) {
		return nil, fmt.Errorf("invalid token address: %s", tokenAddress)
	}

	contractABI, err := abi.JSON(strings.NewReader(erc20ABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ABI: %v", err)
	}

	tokenAddr := common.HexToAddress(tokenAddress)
	walletAddr := common.HexToAddress(walletAddress)

	// 获取代币余额
	balanceResult, err := ec.callContractWithParams(tokenAddr, contractABI, "balanceOf", walletAddr)
	if err != nil {
		return nil, fmt.Errorf("failed to get balance: %v", err)
	}
	balance := balanceResult[0].(*big.Int)

	// 如果余额为0，返回 nil
	if balance.Cmp(big.NewInt(0)) == 0 {
		return nil, nil
	}

	// 获取代币信息
	symbol, err := ec.callContract(tokenAddr, contractABI, "symbol")
	if err != nil {
		return nil, fmt.Errorf("failed to get symbol: %v", err)
	}

	name, err := ec.callContract(tokenAddr, contractABI, "name")
	if err != nil {
		return nil, fmt.Errorf("failed to get name: %v", err)
	}

	decimalsResult, err := ec.callContract(tokenAddr, contractABI, "decimals")
	if err != nil {
		return nil, fmt.Errorf("failed to get decimals: %v", err)
	}

	decimals := decimalsResult[0].(uint8)
	readableBalance := convertTokenBalance(balance, decimals)

	return &TokenInfo{
		Address:    tokenAddress,
		Symbol:     symbol[0].(string),
		Name:       name[0].(string),
		Decimals:   decimals,
		Balance:    readableBalance,
		BalanceRaw: balance.String(),
	}, nil
}

func (ec *EthClient) GetWalletAssetsFromList(walletAddress string, tokenAddresses []string) (*WalletAssets, error) {
	assets := &WalletAssets{
		Address: walletAddress,
		Tokens:  make(map[string]*TokenInfo),
	}

	// 获取 ETH 余额
	ethBalance, err := ec.GetBalance(walletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to get ETH balance: %v", err)
	}
	assets.EthBalance = ethBalance

	// 检查指定代币列表的余额
	for i, tokenAddr := range tokenAddresses {
		fmt.Printf("Checking token %d/%d: %s\n", i+1, len(tokenAddresses), tokenAddr)

		tokenInfo, err := ec.GetTokenBalance(walletAddress, tokenAddr)
		if err != nil {
			fmt.Printf("Warning: failed to get balance for token %s: %v\n", tokenAddr, err)
			continue
		}

		// 只添加有余额的代币
		if tokenInfo != nil {
			assets.Tokens[tokenInfo.Symbol] = tokenInfo
		}
	}

	assets.TotalTokens = len(assets.Tokens)
	return assets, nil
}

func (ec *EthClient) GetAllWalletAssets(walletAddress, etherscanAPIKey string) (*WalletAssets, error) {
	assets := &WalletAssets{
		Address: walletAddress,
		Tokens:  make(map[string]*TokenInfo),
	}

	ethBalance, err := ec.GetBalance(walletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to get ETH balance: %v", err)
	}
	assets.EthBalance = ethBalance

	tokenAddresses, err := ec.getTokenAddressesFromEtherscan(walletAddress, etherscanAPIKey)
	if err != nil {
		fmt.Printf("Warning: failed to get token addresses from Etherscan: %v\n", err)
		return assets, nil
	}

	fmt.Printf("Found %d token addresses, checking balances...\n", len(tokenAddresses))

	for i, tokenAddr := range tokenAddresses {
		fmt.Printf("Checking token %d/%d: %s\n", i+1, len(tokenAddresses), tokenAddr)

		tokenInfo, err := ec.GetTokenBalance(walletAddress, tokenAddr)
		if err != nil {
			fmt.Printf("Warning: failed to get balance for token %s: %v\n", tokenAddr, err)
			continue
		}

		if tokenInfo != nil {
			assets.Tokens[tokenInfo.Symbol] = tokenInfo
		}
	}

	assets.TotalTokens = len(assets.Tokens)
	return assets, nil
}
