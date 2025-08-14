package ethgo

import (
	"context"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

type TransactionInfo struct {
	Hash        string `json:"hash"`
	From        string `json:"from"`
	To          string `json:"to"`
	Value       string `json:"value"`     // Wei
	ValueEth    string `json:"value_eth"` // ETH
	GasLimit    uint64 `json:"gas_limit"`
	GasPrice    string `json:"gas_price"`     // Wei
	GasPriceEth string `json:"gas_price_eth"` // ETH
	BlockNumber uint64 `json:"block_number"`
	BlockHash   string `json:"block_hash"`
	TxIndex     uint   `json:"tx_index"`
	Status      uint64 `json:"status"` // 1 成功, 0 失败
	Type        string `json:"type"`   // "sent" 或 "received"
}

// TransactionList 交易列表响应
type TransactionList struct {
	Address      string             `json:"address"`
	Transactions []*TransactionInfo `json:"transactions"`
	Total        int                `json:"total"`
}

func (ec *EthClient) GetTransactions(address string,
	fromBlock, toBlock *big.Int, limit int) (*TransactionList, error) {
	if !common.IsHexAddress(address) {
		return nil, fmt.Errorf("invalid Ethereum address: %s", address)
	}
	addr := common.HexToAddress(address)
	var transactions []*TransactionInfo

	if fromBlock == nil {
		latestBlock, err := ec.client.BlockNumber(context.Background())
		if err != nil {
			return nil, fmt.Errorf("get latest block number is failed: %v", err)
		}
		fromBlock = big.NewInt(int64(latestBlock))
	}
	if toBlock == nil {
		toBlock = fromBlock
	}
	count, maxBlocks := 0, 100

	for blockNum := new(big.Int).Set(fromBlock); blockNum.Cmp(toBlock) >= 0 && count < limit && maxBlocks > 0; blockNum.Sub(blockNum, big.NewInt(1)) {
		block, err := ec.client.BlockByNumber(context.Background(), blockNum)
		if err != nil {
			continue
		}

		for txIndex, tx := range block.Transactions() {
			if count >= limit {
				break
			}
			var txType string
			var isRelated bool
			if tx.To() != nil && strings.EqualFold(tx.To().Hex(), addr.Hex()) {
				txType = "received"
				isRelated = true
			}

			receipt, err := ec.client.TransactionReceipt(context.Background(), tx.Hash())
			if err != nil {
				if sender, err := ec.getSender(tx); err == nil {
					if strings.EqualFold(sender.Hex(), addr.Hex()) {
						if txType == "" {
							txType = "sent"
						}
						isRelated = true
					}
				}
			}
			if !isRelated {
				continue
			}
			txInfo := &TransactionInfo{
				Hash:        tx.Hash().Hex(),
				To:          "",
				Value:       tx.Value().String(),
				ValueEth:    weiToEth(tx.Value()),
				GasLimit:    tx.Gas(),
				GasPrice:    tx.GasPrice().String(),
				GasPriceEth: weiToEth(tx.GasPrice()),
				BlockNumber: block.Number().Uint64(),
				BlockHash:   block.Hash().Hex(),
				TxIndex:     uint(txIndex),
				Type:        txType,
			}
			if tx.To() != nil {
				txInfo.To = tx.To().Hex()
			}
			if sender, err := ec.getSender(tx); err == nil {
				txInfo.From = sender.Hex()
			}
			if receipt != nil {
				txInfo.Status = receipt.Status
			}
			transactions = append(transactions, txInfo)
			count++
		}
		maxBlocks--
	}
	return &TransactionList{
		Address:      address,
		Transactions: transactions,
		Total:        len(transactions),
	}, nil
}

func (ec *EthClient) getSender(tx *types.Transaction) (common.Address, error) {
	chainID, err := ec.client.NetworkID(context.Background())
	if err != nil {
		return common.Address{}, err
	}

	signer := types.LatestSignerForChainID(chainID)
	return types.Sender(signer, tx)
}

func (ec *EthClient) GetRecentTransactions(address string, limit int) (*TransactionList, error) {
	return ec.GetTransactions(address, nil, nil, limit)
}

func (ec *EthClient) GetTransactionsByBlockRange(address string, fromBlock, toBlock uint64, limit int) (*TransactionList, error) {
	from := big.NewInt(int64(fromBlock))
	to := big.NewInt(int64(toBlock))
	return ec.GetTransactions(address, from, to, limit)
}

func (ec *EthClient) GetTransactionByHash(txHash string) (*TransactionInfo, error) {
	hash := common.HexToHash(txHash)

	tx, isPending, err := ec.client.TransactionByHash(context.Background(), hash)
	if err != nil {
		return nil, fmt.Errorf("get transaction by hash failed: %v", err)
	}

	if isPending {
		return nil, fmt.Errorf("transaction is pending")
	}

	receipt, err := ec.client.TransactionReceipt(context.Background(), hash)
	if err != nil {
		return nil, fmt.Errorf("get transaction receipt failed: %v", err)
	}

	block, err := ec.client.BlockByHash(context.Background(), receipt.BlockHash)
	if err != nil {
		return nil, fmt.Errorf("get block by hash failed: %v", err)
	}

	txInfo := &TransactionInfo{
		Hash:        tx.Hash().Hex(),
		To:          "",
		Value:       tx.Value().String(),
		ValueEth:    weiToEth(tx.Value()),
		GasLimit:    tx.Gas(),
		GasPrice:    tx.GasPrice().String(),
		GasPriceEth: weiToEth(tx.GasPrice()),
		BlockNumber: block.Number().Uint64(),
		BlockHash:   block.Hash().Hex(),
		TxIndex:     receipt.TransactionIndex,
		Status:      receipt.Status,
	}

	if tx.To() != nil {
		txInfo.To = tx.To().Hex()
	}

	if sender, err := ec.getSender(tx); err == nil {
		txInfo.From = sender.Hex()
	}

	return txInfo, nil
}
