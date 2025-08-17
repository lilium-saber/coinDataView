using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace web3cs.Ults;

[JsonSourceGenerationOptions(WriteIndented = true)]
[JsonSerializable(typeof(CoinPriceListResponse))]
[JsonSerializable(typeof(List<CoinPriceList>))]
[JsonSerializable(typeof(UserResponse))]
[JsonSerializable(typeof(CoinPriceTimeResponse))]
[JsonSerializable(typeof(List<CoinPriceTime>))]
[JsonSerializable(typeof(UserWalletResponse))]
[JsonSerializable(typeof(UserUlts.UserWallet))]
[JsonSerializable(typeof(string))]
[JsonSerializable(typeof(List<string>))]
public partial class AppJsonContext : JsonSerializerContext
{
}