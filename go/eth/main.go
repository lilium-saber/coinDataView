package main

import (
	"eth/ethgo"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BalanceResponse struct {
	Success bool               `json:"success"`
	Data    *ethgo.BalanceInfo `json:"data,omitempty"`
	Error   string             `json:"error,omitempty"`
}

type TransactionResponse struct {
	Success bool                   `json:"success"`
	Data    *ethgo.TransactionList `json:"data,omitempty"`
	Error   string                 `json:"error,omitempty"`
}

type TransactionDetailResponse struct {
	Success bool                   `json:"success"`
	Data    *ethgo.TransactionInfo `json:"data,omitempty"`
	Error   string                 `json:"error,omitempty"`
}

func main() {
	r := gin.Default()
	ethClient, err := ethgo.NewEthClient("https://mainnet.infura.io/v3/0f1c325aa6fe4d5da04c9f69201482f1")
	if err != nil {
		panic(err)
	}
	defer ethClient.Close()

	r.GET("/goapi/wallet/balance/:address", func(c *gin.Context) {
		address := c.Param("address")
		balanceInfo, err := ethClient.GetBalance(address)
		if err != nil {
			c.JSON(http.StatusBadRequest, BalanceResponse{
				Success: false,
				Error:   err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, BalanceResponse{
			Success: true,
			Data:    balanceInfo,
		})
	})

	r.GET("/goapi/wallet/txs10/:address", func(c *gin.Context) {
		address := c.Param("address")
		limit := 10
		if limitStr := c.Query("limit"); limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
				limit = l
			}
		}
		txList, err := ethClient.GetRecentTransactions(address, limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, TransactionResponse{
				Success: false,
				Error:   err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, TransactionResponse{
			Success: true,
			Data:    txList,
		})
	})

	r.GET("/goapi/wallet/txhex/:txhash", func(c *gin.Context) {
		hash := c.Param("txhash")
		txInfo, err := ethClient.GetTransactionByHash(hash)
		if err != nil {
			c.JSON(http.StatusBadRequest, TransactionDetailResponse{
				Success: false,
				Error:   err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, TransactionDetailResponse{
			Success: true,
			Data:    txInfo,
		})
	})

	r.Run(":11480")
}
