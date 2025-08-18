import React from "react";
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import {UseAuth} from "../context/AuthContext";
import { useNavigate } from "react-router-dom";



export function TopStrip() {
    const { isLoggedIn, setIsLoggedIn, username, setUsername } = UseAuth();
    const navigate = useNavigate();

    return(
        <AppBar position={'static'}>
            <Toolbar variant="dense">
                <Box sx={{flexGrow: 1}} />
                <Box sx={{display: "flex", justifyContent: "center", flexGrow: 1}}>
                    <Button color={"inherit"} onClick={() => navigate("/")}>
                        home
                    </Button>
                    <Button color={"inherit"} onClick={() => navigate("/market")}>
                        market
                    </Button>
                    <Button color={"inherit"} onClick={() => navigate("/wallet")}>
                        wallet
                    </Button>
                </Box>
                <Box sx={{flexGrow: 1, display: "flex", justifyContent: "flex-end"}}>
                    {isLoggedIn ? (
                        <Typography variant={"body2"}>
                            welcome, {username}
                        </Typography>
                    ) : (
                        <Button color={"inherit"} onClick={() => navigate("/login")}>
                            sign in
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    )
}