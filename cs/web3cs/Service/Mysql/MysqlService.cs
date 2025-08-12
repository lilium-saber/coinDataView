using System;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Threading.Tasks;

namespace web3cs.Service.Mysql;

public class MysqlDbcontext : DbContext {
    public DbSet<Model.User.User> Users { get; set; }
    public DbSet<Model.User.UserWallet> UserWallets { get; set; }
    public DbSet<Model.User.UserPassword> UserPasswords { get; set; }
    
    public MysqlDbcontext(DbContextOptions<MysqlDbcontext> options) : base(options) { }
}

public class MysqlService {
    private readonly MysqlDbcontext _dbcontext;

    public MysqlService(MysqlDbcontext dbcontext) {
        _dbcontext = dbcontext;
    }

    private static (string hash, string salt) hashPassword(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToBase64String(saltBytes);
        var combined = Encoding.UTF8.GetBytes(password + salt);
        var hashBytes = SHA256.HashData(combined);
        var hash = Convert.ToBase64String(hashBytes);
        return (hash, salt);
    }
    
    public async Task<bool> RegisterUser(string userId, string password, string? userName, string? userEmail) {
        if (await _dbcontext.Users.AnyAsync(u => u.UserId == userId)) {
            return false; // User already exists
        }
        var (hash, salt) = hashPassword(password);
        var user = new Model.User.User {
            UserId = userId,
            UserName = userName,
            UserEmail = userEmail,
            UserPassword = hash
        };
        await _dbcontext.SaveChangesAsync();
        var userPassword = new Model.User.UserPassword {
            UserId = userId,
            UserPasswordHash = salt
        };
        await _dbcontext.UserPasswords.AddAsync(userPassword);
        await _dbcontext.Users.AddAsync(user);
        await _dbcontext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> LoginUser(string userId, string password) {
        var user = await _dbcontext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null) {
            return false; // User not found
        }
        var userPassword = await _dbcontext.UserPasswords.FirstOrDefaultAsync(up => up.UserId == userId);
        if (userPassword == null) {
            return false; // Password not found
        }
        var salt = userPassword.UserPasswordHash;
        var combined = Encoding.UTF8.GetBytes(password + salt);
        var hashBytes = SHA256.HashData(combined);
        var hash = Convert.ToBase64String(hashBytes);
        return hash == user.UserPassword;
    }

}