package main

import (
	"coinprices/coingecko"
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
)

func main() {
	coins := []string{"bitcoin", "ethereum", "sui", "dogecoin", "solana", "tron"}
	redisDb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Username: "",
		Password: "",
		DB:       0,
	})
	ctx := context.Background()
	_, err := redisDb.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Redis连接失败: %v\n", err)
		return
	}
	fmt.Println("Redis连接成功")
	influxURL := "http://localhost:8086"
	influxToken := "pkUoI3KQ6ThTCdAWrGYStrSS1X3F0IcqixsyHvINRzg2pStrGcgEAUaJ-40_-sPclEYIsk0Bc44UuHf5AdN2qg=="
	influxOrg := "6"
	influxBucket := "6"
	influxClient := influxdb2.NewClient(influxURL, influxToken)
	writeApi := influxClient.WriteAPIBlocking(influxOrg, influxBucket)
	defer influxClient.Close()

	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for {
		prices, err := coingecko.FetchPrices(coins)
		if err != nil {
			fmt.Printf("获取币种价格失败: %v", err)
			return
		}
		for coin, price := range prices {
			redisString := fmt.Sprintf("%.5f", price)
			err := redisDb.Set(ctx, coin, redisString, 0).Err()
			if err != nil {
				fmt.Printf("存储价格到 Redis 失败: %v", err)
				return
			}
			p := influxdb2.NewPoint(
				"coin_prices",
				map[string]string{"coin": coin},
				map[string]interface{}{"price": price},
				time.Now(),
			)
			if err := writeApi.WritePoint(ctx, p); err != nil {
				fmt.Printf("写入 InfluxDB 失败: %v", err)
				return
			}
		}
		fmt.Println("价格已更新到 Redis 和 InfluxDB")
		<-ticker.C
	}
}
