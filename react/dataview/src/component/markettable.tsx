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

    const fetchCoinPriceNowData = () => {
        setLoading(true);
        fetch("http://localhost:11434/api/cry/getallpricenow")
            .then(res => res.json())
            .then(json => {
                setData(json.pricelist);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        fetchCoinPriceNowData();
        const timer = setInterval(fetchCoinPriceNowData, 1000 * 60 * 5);
        return () => clearInterval(timer);
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
                        <TableCell>Coin Name</TableCell>
                        <TableCell>Coin Price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((coin, index) => (
                        <TableRow key={index}>
                            <TableCell>{coin.CoinName}</TableCell>
                            <TableCell>{coin.CoinPrice}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}