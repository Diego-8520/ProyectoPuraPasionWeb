using System.ComponentModel.DataAnnotations; // Para validaciones
using System.ComponentModel.DataAnnotations.Schema; // Para mapear columnas
namespace Backend.Models;

[Table("Productos")] // Indicamos el nombre exacto de la tabla en Supabase
public class Producto
{
    [Key]
    [Column("id")] // Coincide con la columna real
    public Guid Id { get; set; }

    [Required]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("precio_venta")]
    public decimal Precio { get; set; }

    [Column("stock")]
    public int Stock { get; set; }

    [Required]
    [Column("categoria")]
    public string Categoria { get; set; } = "General";

    [Column("imagen_url")]
    public string? ImagenUrl { get; set; }

    // Nuevas columnas que sí existen en la BD
    [Column("costo")]
    public decimal Costo { get; set; }

    [Column("codigo_producto")]
    public int CodigoProducto { get; set; }

    [Column("codigo_visible")]
    public string CodigoVisible { get; set; } = string.Empty;

    [Column("marca")]
    public string Marca { get; set; } = string.Empty;

    [Column("talla")]
    public string Talla { get; set; } = string.Empty;

    [Column("color")]
    public string Color { get; set; } = string.Empty;

    [Column("genero")]
    public string Genero { get; set; } = string.Empty;
}