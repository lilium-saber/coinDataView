using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace web3cs.Ults;

public class CoinPriceListResponse {
    public required List<CoinPriceList> pricelist { get; set; }
}

public class CoinPriceTimeResponse {
    public required string coinname { get; set; }
    public required List<CoinPriceTime> pricetime { get; set; }
}

public class UserResponse {
    public required int success { get; set; }
    public required string message { get; set; }
}