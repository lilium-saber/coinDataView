package coingecko

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type PriceResponse struct {
	Bitcoin struct {
		Use float64 `json:"usd"`
	} `json:"bitcoin"`
}

func FetchPrices(coins []string) (map[string]float64, error) {
	ids := strings.Join(coins, ",")
	url := fmt.Sprintf("https://api.coingecko.com/api/v3/simple/price?ids=%s&vs_currencies=usd", ids)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	var result map[string]map[string]float64
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	prices := make(map[string]float64)
	for _, coin := range coins {
		price, ok := result[coin]["usd"]
		if !ok {
			return nil, fmt.Errorf("未找到币种 %s 的价格", coin)
		}
		prices[coin] = price
	}
	return prices, nil
}
