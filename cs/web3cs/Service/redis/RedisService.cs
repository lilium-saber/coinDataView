using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StackExchange.Redis;
using web3cs.Ults;

namespace web3cs.Service.redis;

public class RedisService(IConnectionMultiplexer redis) {
    private readonly IDatabase _database0 = redis.GetDatabase(0); // default database 0

    public async Task<string> GetStringAsync(string key) {
        var res = await _database0.StringGetAsync(key);
        return res.IsNull ? "null" : res.ToString();
    }
    
    public async Task SetStringAsync(string key, string value) {
        await _database0.StringSetAsync(key, value);
    }
    
    public async Task<List<CoinPriceList>> GetCoinPriceListAsync() {
        var tasks = Ults.CoinUlts.CoinNames.Select(async x => new CoinPriceList {
            CoinName = x,
            CoinPrice = await GetStringAsync(x)
        });
        var res = await Task.WhenAll(tasks);
        return [..res];
    }
}