import React from "react";
import { Select, MenuItem, FormControl,
    InputLabel, Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import ReactECharts from "echarts-for-react";

import {json} from "node:stream/consumers";

//public static readonly List<string> CoinNames = ["bitcoin",
//         "dogecoin", "ethereum", "solana", "tron", "sui"];
const coinNames = ["bitcoin", "dogecoin", "ethereum", "solana", "tron", "sui"];

export function CoinPriceTimeAnalyse() {
    const [selectedCoin, setSelectedCoin] = React.useState(coinNames[0]);
    const [priceTimeData, setPriceTimeData] = React.useState<{ CoinPrice: string; CoinTime: string }[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = (coin : string) => {
        setLoading(true);
        fetch(`http://localhost:11434/api/cry/getpricetime/${coin}`)
            .then(res => res.json())
            .then(json => {
                setPriceTimeData(json.pricetime);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        fetchData(selectedCoin);
    }, [selectedCoin]);

    const option = {
        title: { text: `${selectedCoin} Price Over Time` },
        tooltip: { trigger: "axis" },
        xAxis: {
            type: "category",
            data: priceTimeData.map(item => item.CoinTime),
            name: "Time"
        },
        yAxis: {
            type: "value",
            name: "Price"
        },
        series: [
            {
                data: priceTimeData.map(item => parseFloat(item.CoinPrice)),
                type: "line",
                smooth: true,
                name: "Price"
            }
        ]
    };

    const heatmapData = priceTimeData.map((item, idx) => [idx, 0, parseFloat(item.CoinPrice)]);
    const heatmapOption = {
        title: { text: `${selectedCoin} Price Heatmap` },
        tooltip: { position: "top" },
        grid: { height: 50, top: 40 },
        xAxis: {
            type: "category",
            data: priceTimeData.map(item => item.CoinTime),
            name: "Time"
        },
        yAxis: {
            type: "category",
            data: [selectedCoin],
            name: "Coin"
        },
        visualMap: {
            min: Math.min(...priceTimeData.map(item => parseFloat(item.CoinPrice))),
            max: Math.max(...priceTimeData.map(item => parseFloat(item.CoinPrice))),
            calculable: true,
            orient: "horizontal",
            left: "center",
            bottom: 10
        },
        series: [
            {
                name: "Price",
                type: "heatmap",
                data: heatmapData,
                label: { show: false }
            }
        ]
    };

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                    value={selectedCoin}
                    exclusive
                    onChange={(_, value) => value && setSelectedCoin(value)}
                    aria-label="coin name"
                >
                    {coinNames.map(name => (
                        <ToggleButton key={name} value={name} aria-label={name}>
                            {name}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            {loading ? (
                <div>Loading data...</div>
            ) : (
                <div className="coin-price-time-analyse">
                    <ReactECharts option={option} style={{ height: 400 }} />
                    <ReactECharts option={heatmapOption} style={{ height: 120, marginTop: 24 }} />
                </div>
            )}
        </Box>
    );
}