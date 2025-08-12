using System;
using System.Collections.Generic;

namespace web3cs.Ults;

public static class CoinUlts {
    public static readonly List<string> CoinNames = ["bitcoin", 
        "dogecoin", "ethereum", "solana", "tron", "sui"];
}

public class CoinPriceList {
    public required string CoinName { get; set; }
    public required string CoinPrice { get; set; }
}

public class CoinPriceTime {
    public required string CoinPrice { get; set; }
    public required DateTime CoinTime { get; set; }
}