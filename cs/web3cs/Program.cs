using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using web3cs.Service.incluxdb;
using web3cs.Service.jwt;
using web3cs.Service.Mysql;
using web3cs.Service.redis;
using web3cs.Ults;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
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

var app = builder.Build();


app.MapGet("api/cry/getpricetime/{coinname}",
           async (InfluxdbService influxdbService, string coinname) => 
               Results.Ok(new CoinPriceTimeResponse { coinname = coinname, pricetime = await influxdbService.QueryCoinPriceAsync(coinname) }));

app.MapGet("api/cry/getallpricenow", async (RedisService redisService) => 
                                         Results.Ok(new CoinPriceListResponse { pricelist = await redisService.GetCoinPriceListAsync() }));

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

app.Run("http://localhost:11434");
