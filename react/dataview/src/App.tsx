import React from 'react';
import './App.css';
import {AuthProvider} from "./context/AuthContext";
import {HomePage} from "./pages/homepage";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {MarketPage} from "./pages/marketpage";
import {CoinPriceTimeAnalyse} from "./component/CoinPriceTimeAnalyse";

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/price" element={<CoinPriceTimeAnalyse />} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
