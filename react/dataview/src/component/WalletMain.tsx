import React from "react";
import { UseAuth } from "../context/AuthContext";
import { ethers } from "ethers";
import { Box, Button, TextField, Alert, Card, CardContent, Typography } from "@mui/material";

interface BalanceInfo {
    address: string;
    balance_wei: string;
    balance_eth: string;
}

interface BalanceResponse {
    success: boolean;
    data?: BalanceInfo;
    error?: string;
}


export function WalletMain() {
    const { isLoggedIn, username } = UseAuth();
    const [addressList, setAddressList] = React.useState<string[]>([]);
    const [address, setAddress] = React.useState<string>("");
    const [balanceInfo, setBalanceInfo] = React.useState<BalanceInfo | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");

    const getBalance = async () => {
        if (!address.trim()) {
            alert("Please enter a valid address");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`http://localhost:11480/goapi/wallet/balance/${address}`);
            const data: BalanceResponse = await response.json();
            if (data.success && data.data) {
                setBalanceInfo(data.data);
            } else {
                setError(data.error || "查询失败");
            }
        } catch (err) {
            setError("网络请求失败");
            console.error("获取余额失败:", err);
        }
        setLoading(false);
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            getBalance();
        }
    };


    if (isLoggedIn) {
        <Box sx={{p: 3, maxWidth: 600, mx: "auto"}}>
            <Box sx={{mb: 3}}>
                <TextField
                    fullWidth
                    label="input eth wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="0x..."
                    variant="outlined"
                    sx={{mb: 2}}
                />
            </Box>
            <Button onClick={getBalance} 
                disabled={loading || !address.trim()}
                size="large">
                {loading ? "Loading..." : "Get Balance"}
            </Button>
        </Box>
        {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
        )}
        {balanceInfo && (
            <Card sx={{mt: 3}}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Balance for address: {balanceInfo.address}
                    </Typography>
                    <Typography variant="h3" color="text.primary" gutterBottom>
                        {balanceInfo.balance_eth} ETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {balanceInfo.balance_wei} WEI
                    </Typography>
                </CardContent>
            </Card>
        )}
        {!balanceInfo && !error && !loading && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Enter an address to check the balance
                </Typography>
            </Box>
        )}
    } else {
        return (
            <div>
                <h1>Please log in</h1>
            </div>
        );
    }
}
