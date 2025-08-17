namespace web3cs.Ults;

public class UserUlts {
    public class UserLoginRequest {
        public required string UserId { get; set; }
        public required string UserPassword { get; set; }
    }
    
    public class UserLogupRequest {
        public required string UserId { get; set; }
        public required string UserPassword { get; set; }
        public string? UserEmail { get; set; }
        public string? UserName { get; set; }
    }
    
    public class UserWallet {
        public required List<string> walletAddress { get; set; }
    }
}