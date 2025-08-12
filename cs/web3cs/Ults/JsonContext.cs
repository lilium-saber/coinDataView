using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace web3cs.Ults;

[JsonSourceGenerationOptions(WriteIndented = true)]
[JsonSerializable(typeof(CoinPriceListResponse))]
[JsonSerializable(typeof(List<CoinPriceList>))]
[JsonSerializable(typeof(UserResponse))]
[JsonSerializable(typeof(CoinPriceTimeResponse))]
[JsonSerializable(typeof(List<CoinPriceTime>))]
public partial class AppJsonContext : JsonSerializerContext
{
}