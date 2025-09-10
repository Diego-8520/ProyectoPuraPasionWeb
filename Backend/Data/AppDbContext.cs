using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data; //Namespace del proyecto

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos { get; set; } = null!; // = null! evita warnings

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>()
            .HasIndex(p => p.Nombre)
            .IsUnique();
    }

}