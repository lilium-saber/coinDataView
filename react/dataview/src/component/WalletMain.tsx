import React from "react";
import { UseAuth } from "../context/AuthContext";
import { ethers } from "ethers";


export function WalletMain() {
    const { isLoggedIn, username } = UseAuth();
    const [address, setAddress] = React.useState<string>("");
    const [balance, setBalance] = React.useState<string>("");

    if (isLoggedIn) {

    } else {
        return (
            <div>
                <h1>Please log in</h1>
            </div>
        );
    }
}
