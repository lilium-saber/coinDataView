import React from "react";
import { TopStrip } from "../component/topstrip";
import { ConnectWallet } from "../component/ConnetWallet";

export function ConnectAddressPage() {
    return(
        <div>
            <TopStrip />
            <ConnectWallet />
        </div>
    )
}