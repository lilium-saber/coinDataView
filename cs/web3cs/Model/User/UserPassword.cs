using System.ComponentModel.DataAnnotations;

namespace web3cs.Model.User;

public class UserPassword {
    [Key]
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required string UserPasswordHash { get; set; } // salt hash
}