import React from "react";
import {Table, TableBody, TableHead,
    TableRow, TableCell, Typography, Box} from "@mui/material";

interface CoinPriceList {
    CoinName: string;
    CoinPrice: string;
}

export function MarketTable() {
    const [data, setData] = React.useState<CoinPriceList[]>([]);
    const [loading, setLoading] = React.useState(true);

    // const fetchCoinPriceNowData = () => {
    //     setLoading(true);
    //     fetch("http://localhost:11434/api/cry/getallpricenow")
    //         .then(res => res.json())
    //         .then(json => {
    //             const transformedData = json.pricelist.map((item: any) => ({
    //             CoinName: item.coinName,
    //             CoinPrice: item.coinPrice
    //             }));
    //             setData(transformedData);
    //             setLoading(false);
    //         });
    // };

    React.useEffect(() => {
        let ws: WebSocket | null = null;
        setLoading(true);
        ws = new WebSocket("ws://localhost:11434/api/cry/ws/getallprice");
        ws.onopen = () => {
            setLoading(false);
        }
        ws.onmessage = (event) => {
            try {
                const json = JSON.parse(event.data);
                const transformedData = json.pricelist.map((item: any) => ({
                    CoinName: item.coinName,
                    CoinPrice: item.coinPrice
                }));
                setData(transformedData);
            } catch (e) {
                console.error("Error parsing WebSocket message:", e);
            }
        }
        ws.onerror = () => {
            setLoading(false);
        }
        return () => {
            if (ws) {
                ws.close();
            }
        }
    }, []);


    if (loading) return <div>data is loading...</div>;

    return (
        <div>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" gutterBottom>
                    Coin Price Now
                </Typography>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align={"center"}>Coin Name</TableCell>
                        <TableCell align={"center"}>Coin Price(USDT)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((coin, index) => (
                        <TableRow key={index}>
                            <TableCell align={"center"}>{coin.CoinName}</TableCell>
                            <TableCell align={"center"}>{coin.CoinPrice}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}