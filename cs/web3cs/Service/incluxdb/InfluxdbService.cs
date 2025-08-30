using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InfluxDB.Client;
using web3cs.Ults;

namespace web3cs.Service.incluxdb;

public class InfluxdbService {
    private readonly string _url = "http://localhost:8086";
    private readonly string _token = "pkUoI3KQ6ThTCdAWrGYStrSS1X3F0IcqixsyHvINRzg2pStrGcgEAUaJ-40_-sPclEYIsk0Bc44UuHf5AdN2qg==";
    private readonly string _org = "6";
    private readonly string _bucket = "6";

    public async Task QueryCoinPriceTestAsync() {
        using var client = new InfluxDBClient(_url, _token);
        var flux = $"from(bucket: \"{_bucket}\") |> range(start: -1h)" +
                   $"|> filter(fn: (r) => r._measurement == \"coin_prices\")";
        var tables = await client.GetQueryApi().QueryAsync(flux, _org);
        foreach (var record in tables.SelectMany(t => t.Records))
        {
            var coin = record.GetValueByKey("coin"); // 标签
            var price = record.GetValue();           // 字段值
            var time = record.GetTime();             // 时间戳
            Console.WriteLine($"coin: {coin}, price: {price}, time: {time}");
        }
    }

    public async Task<List<CoinPriceTime>> QueryCoinPriceAsync(string coinName,
                                                               int timeRange = 1) {
        timeRange = timeRange switch {
                        < 1 => 1,
                        > 24 => 24,
                        _ => timeRange
                    };
        using var client = new InfluxDBClient(_url, _token);
        var flux = $"from(bucket: \"{_bucket}\") |> range(start: -1h)" +
                   $"|> filter(fn: (r) => r._measurement == \"coin_prices\" and " +
                   $"r.coin == \"{coinName}\")";
        var tables = await client.GetQueryApi().QueryAsync(flux, _org);

        return [.. from record in tables.SelectMany(t => t.Records) 
                let price = record.GetValue().ToString()
                let time = record.GetTime()?.ToDateTimeUtc() ?? DateTime.MinValue 
                select new CoinPriceTime {
                    CoinPrice = price!,
                    CoinTime = time }
        ];
    }

    public async Task<List<KLineData>> QueryKLineAsync(string coinName, string interval = "5m", int rangeHour = 1)
    {
        using var client = new InfluxDBClient(_url, _token);
        var flux = $@"
            from(bucket: ""{_bucket}"")
            |> range(start: -{rangeHour}h)
            |> filter(fn: (r) => r._measurement == ""coin_prices"" and r.coin == ""{coinName}"")
            |> aggregateWindow(every: {interval}, fn: min, column: ""_value"", createEmpty: false)
            |> yield(name: ""min"")
            |> aggregateWindow(every: {interval}, fn: max, column: ""_value"", createEmpty: false)
            |> yield(name: ""max"")
            |> aggregateWindow(every: {interval}, fn: first, column: ""_value"", createEmpty: false)
            |> yield(name: ""open"")
            |> aggregateWindow(every: {interval}, fn: last, column: ""_value"", createEmpty: false)
            |> yield(name: ""close"")
        ";

        var tables = await client.GetQueryApi().QueryAsync(flux, _org);

        // 解析tables，组合成K线数据
        var klineList = new List<KLineData>();
        // 这里需要根据yield的name分组，合并open、close、min、max
        // 具体解析略，可根据实际数据结构调整

        return klineList;
    }
}