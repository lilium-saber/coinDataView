package ethgo

import (
	"context"
	"fmt"
	"math/big"

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
