using System.Text.Json.Serialization;
using System.Net.WebSockets;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using web3cs.Service.incluxdb;
using web3cs.Service.jwt;
using web3cs.Service.Mysql;
using web3cs.Service.redis;
using web3cs.Ults;
using web3cs.Service.WebSocket;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
                         {
                             options.AddPolicy("AllowSpecificOrigins", policy =>
                                                                       {
                                                                           policy.AllowAnyOrigin()
                                                                               .AllowAnyMethod()
                                                                               .AllowAnyHeader();
                                                                       });
                         });
builder.Services.ConfigureHttpJsonOptions(options =>
                                          {
                                              options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                                              options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default);
                                          });

var config = builder.Configuration;

var redisUrl = config["redis"];
builder.Services.AddSingleton<IConnectionMultiplexer> (sp =>
                                                           ConnectionMultiplexer.Connect(redisUrl!));
builder.Services.AddScoped<RedisService>();
builder.Services.AddScoped<InfluxdbService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddDbContext<MysqlDbcontext>(options =>
                                                  options.UseMySQL(config["mysql"]!));
builder.Services.AddScoped<MysqlService>();
builder.Services.AddScoped<WebSocketService>();

var app = builder.Build();
app.UseCors("AllowSpecificOrigins");
app.UseWebSockets();


app.MapGet("api/cry/getpricetime/{coinname}", async (InfluxdbService influxdbService, string coinname) => 
               Results.Ok(new CoinPriceTimeResponse { coinname = coinname, pricetime = await influxdbService.QueryCoinPriceAsync(coinname) }));

app.MapGet("api/cry/getallpricenow", async (RedisService redisService) => 
                                         Results.Ok(new CoinPriceListResponse { pricelist = await redisService.GetCoinPriceListAsync() }));

app.Map("api/cry/ws/getallprice", async (HttpContext context, RedisService redisService) => {
    if (context.WebSockets.IsWebSocketRequest) {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var cancellationToken = CancellationToken.None;
        while (webSocket.State == WebSocketState.Open) {
            var response = new CoinPriceListResponse { pricelist = await redisService.GetCoinPriceListAsync() };
            var json = System.Text.Json.JsonSerializer.Serialize(response);
            var sendBuffer = System.Text.Encoding.UTF8.GetBytes(json);
            await webSocket.SendAsync(sendBuffer, WebSocketMessageType.Text, true, cancellationToken);
            await Task.Delay(30000, cancellationToken);
            if (webSocket.CloseStatus.HasValue) {
                break;
            }
        }
    } else {
        context.Response.StatusCode = 400;
    }
});

app.MapPost("api/user/register", async (MysqlService mysqlService, UserUlts.UserLogupRequest userRequest) => 
                                     Results.Ok(await mysqlService.
                                                    RegisterUser(userRequest.UserId, userRequest.UserPassword, userRequest.UserName, userRequest.UserEmail) ? 
                                                    new UserResponse { success = 1, message = "Registration successful" } : 
                                                    new UserResponse { success = 0, message = "User already exists" }));

app.MapPost("api/user/login",
            async (MysqlService mysqlService, JwtService jwtService, UserUlts.UserLoginRequest userRequest) => 
                await mysqlService.LoginUser(userRequest.UserId, userRequest.UserPassword) ?
                Results.Ok(new UserResponse { success = 1, message = jwtService.GenerateToken(userRequest.UserId) }) :
                Results.Ok(new UserResponse { success = 0, message = "Invalid user ID or password" }));

app.MapGet("api/user/getwallet/{userid}/{jwt}",
           async (MysqlService mysqlService, JwtService jwtService, string userid, string jwt) => {
                if (!jwtService.ValidateToken(jwt))
                {
                    return Results.Unauthorized();
                }
                var wallet = await mysqlService.GetUserWallet(userid);
                return wallet != null ? 
                     Results.Ok(new UserWalletResponse { success = 1, walletAddr = wallet }) : 
                     Results.Ok(new UserWalletResponse { success = 0, walletAddr = null });
           });

app.MapGet("api/user/setwallet/{userid}/{addr}/{jwt}",
           async (MysqlService mysqlService, JwtService jwtService, string userid, string addr, string jwt) => {
               if (!jwtService.ValidateToken(jwt)) {
                   return Results.Unauthorized();
               }
               var success = await mysqlService.AddUserWallet(userid, addr);
               return success ? 
                   Results.Ok(new UserResponse { success = 1, message = "Wallet address added successfully" }) : 
                   Results.Ok(new UserResponse { success = 0, message = "Failed to add wallet address" });
           });

app.Run("http://localhost:11434");
