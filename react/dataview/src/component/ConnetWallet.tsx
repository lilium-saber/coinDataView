import React from "react";
import { UseAuth } from "../context/AuthContext";
import { Alert, Box, Button, Container, Paper, TextField, Typography } from "@mui/material";

interface UserResponse {
    success: number;
    message: string;
}

export function ConnectWallet() {
    const { isLoggedIn, username, userId } = UseAuth();    
    const [loading, setLoading] = React.useState<boolean>(false);
    const [walletAddress, setWalletAddress] = React.useState<string>("");
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);




    const getJwtFromCookie = (): string | null => {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    const isValidEthereumAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    const handleSubmit = async () => {
        if (!walletAddress.trim()) {
            setMessage({ type: 'error', text: 'please enter wallet address' });
            return;
        }

        if (!isValidEthereumAddress(walletAddress)) {
            setMessage({ type: 'error', text: 'please enter a valid Ethereum wallet address' });
            return;
        }

        const jwt = getJwtFromCookie();
        if (!jwt) {
            setMessage({ type: 'error', text: 'please log in again' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`http://localhost:11434/api/user/setwallet/${userId}/${walletAddress}/${jwt}`, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setMessage({ type: 'error', text: 'authentication failed, please log in again' });
                } else {
                    setMessage({ type: 'error', text: 'request failed, please try again later' });
                }
                return;
            }

            const data: UserResponse = await response.json();
            
            if (data.success === 1) {
                setMessage({ type: 'success', text: data.message });
                setWalletAddress(""); // clear input
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'network error, please try again later' });
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setWalletAddress(value);
        if (message?.type === 'error') {
            setMessage(null);
        }
    };

    if (isLoggedIn) {
        return (
            <div>
                <Container maxWidth="sm" sx={{ mt: 4 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Box display={"flex"} alignItems={"center"} mb={3}>
                            <Typography variant={"h4"} component={"h1"}>
                                Connect Wallet Address
                            </Typography>
                        </Box>
                        <Typography variant={"body1"} color={"text.secondary"} sx={{ mb: 3 }}>
                            Welcome {username}, please connect your wallet address.
                        </Typography>
                        <Box component={"form"} sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label={"ETH Wallet Address"}
                                placeholder={"0x..."}
                                value={walletAddress}
                                onChange={handleAddressChange}
                                variant={"outlined"}
                                sx={{ mb: 2 }}
                                error={message?.type === 'error' && walletAddress.length > 0 && !isValidEthereumAddress(walletAddress)}
                                helperText={
                                    message?.type === 'error' && walletAddress.length > 0 && !isValidEthereumAddress(walletAddress) 
                                    ? "please enter a valid Ethereum address format (0x + 40 hexadecimal characters)"
                                    : "Example format: 0x1234567890abcdef1234567890abcdef12345678"
                                }
                                disabled={loading}
                            />
                            <Button
                                fullWidth
                                variant={"contained"}
                                onClick={handleSubmit}
                                disabled={loading || !walletAddress.trim()}
                                sx={{ py: 1.5 }}    
                            >
                                {loading ? 'Connecting...' : 'Connect Wallet Address'}
                            </Button>
                        </Box>
                        {message && (
                            <Alert severity={message.type} sx={{ mt: 2 }} onClose={() => setMessage(null)}>
                                {message.text}
                            </Alert>
                        )}
                    </Paper>
                </Container>
            </div>
        )
    } else {
        return (
            <div>
                <h2>please log in</h2>
            </div>
        )
    }
}