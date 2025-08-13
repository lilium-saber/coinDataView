import React from "react";
import {TopStrip} from "../component/topstrip";
import {CoinPriceTimeAnalyse} from "../component/CoinPriceTimeAnalyse";

export function CoinPriceAnalysePage() {
    return (
        <div>
            <TopStrip />
            <CoinPriceTimeAnalyse />
        </div>
    );
}