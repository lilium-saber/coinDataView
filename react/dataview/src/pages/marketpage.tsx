import React from "react";
import {MarketTable} from "../component/markettable";
import {TopStrip} from "../component/topstrip";

export function MarketPage() {
    return (
        <div>
            <TopStrip />
            <MarketTable />
        </div>
    );
}