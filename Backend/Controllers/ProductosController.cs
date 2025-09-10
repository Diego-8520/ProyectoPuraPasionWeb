using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProductosController> _logger;

        public ProductosController(AppDbContext context, ILogger<ProductosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            try
            {
                _logger.LogInformation("Obteniendo todos los productos");

                // DEBUG: Mostrar el connection string que está usando
                var connectionString = _context.Database.GetConnectionString();
                _logger.LogInformation($"Connection string: {connectionString}");

                var productos = await _context.Productos.ToListAsync();
                _logger.LogInformation($"Se encontraron {productos.Count} productos");
                return Ok(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, innerException = ex.InnerException?.Message });
            }
        }

        // GET: api/productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            try
            {
                _logger.LogInformation($"Buscando producto con ID: {id}");
                var producto = await _context.Productos.FindAsync(id);

                if (producto == null)
                {
                    _logger.LogWarning($"Producto con ID {id} no encontrado");
                    return NotFound(new { message = $"Producto con ID {id} no encontrado" });
                }

                return Ok(producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener producto con ID: {id}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // POST: api/productos
        [HttpPost]
        public async Task<ActionResult<Producto>> CreateProducto(Producto producto)
        {
            try
            {
                _context.Productos.Add(producto);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear producto");
                return StatusCode(500, new { message = "Error al crear producto", error = ex.Message });
            }
        }
    }
}