using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace web3cs.Model.User;

public class User {
    [Key]
    public int Id { get; set; }
    public required string UserId { get; set; } //max 255 characters
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public required string UserPassword { get; set; }
}