import React from "react";
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import {UseAuth} from "../context/AuthContext";



export function TopStrip() {
    const { isLoggedIn, setIsLoggedIn, username, setUsername } = UseAuth();
    return(
        <AppBar position={'static'}>
            <Toolbar variant="dense">
                <Box sx={{flexGrow: 1}} />
                <Box sx={{display: "flex", justifyContent: "center", flexGrow: 1}}>
                    <Button color={"inherit"}>home</Button>
                    <Button color={"inherit"}>market</Button>
                    <Button color={"inherit"}>wallet</Button>
                </Box>
                <Box sx={{flexGrow: 1, display: "flex", justifyContent: "flex-end"}}>
                    {isLoggedIn ? (
                        <Typography variant={"body2"}>
                            welcome, {username}
                        </Typography>
                    ) : (
                        <Button color={"inherit"} onClick={() => {setIsLoggedIn(true); setUsername("human")}}>
                            sign in
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    )
}