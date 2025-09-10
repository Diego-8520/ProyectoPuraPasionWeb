// detalleProducto.js - Manejo de la página de detalle del producto

// 1. Configuración de la API (igual que en cargueInventario.js)
const API_URL = 'https://localhost:7272/api';
let productosGlobal = [];

// 2. Función para cargar todos los productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/Productos`);
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const productos = await response.json();
        productosGlobal = productos;
        return productos;
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        return [];
    }
}

// 3. Función para mostrar productos relacionados
function mostrarProductosRelacionados(productos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${prod.imagenUrl || 'img/default-product.jpg'}" alt="${prod.nombre}" class="product-image" />
            </div>
            <div class="product-info">
                <h3 class="product-title">${prod.nombre}</h3>
                <p class="product-category">${prod.categoria}</p>
                <div class="product-price">
                    <span class="current-price">$${prod.precio.toLocaleString()}</span>
                </div>
                <div class="product-actions">
                    <a href="detalleProducto.html?id=${prod.id}" class="btn btn-small">
                        Ver Detalle
                    </a>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// 4. Función principal para mostrar el detalle del producto
async function mostrarDetalleProducto() {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('id');

    if (!productoId) {
        document.getElementById('productTitle').textContent = "Producto no especificado";
        return;
    }

    try {
        // Cargar todos los productos si no están cargados
        if (productosGlobal.length === 0) {
            productosGlobal = await cargarProductos();
        }

        // Buscar el producto por ID
        const producto = productosGlobal.find(p => p.id == productoId);
        
        if (!producto) {
            document.getElementById('productTitle').textContent = "Producto no encontrado";
            return;
        }

        // Mostrar datos del producto
        document.getElementById('productTitle').textContent = producto.nombre;
        document.getElementById('productPrice').textContent = `$${producto.precio.toLocaleString()}`;
        document.getElementById('productDescription').textContent = producto.descripcion || 'Sin descripción';
        document.getElementById('productStock').textContent = producto.stock > 0 
            ? `Disponible (${producto.stock} unidades)` 
            : 'Agotado';

        // Imagen principal
        const imgElement = document.getElementById('productImage');
        imgElement.src = producto.imagenUrl || './img/default-product.jpg';
        imgElement.alt = producto.nombre;

        // Thumbnails (si tienes imágenes adicionales en tu API)
        const thumbnailsContainer = document.getElementById('thumbnails');
        if (producto.imagenesAdicionales) {
            const imagenes = Array.isArray(producto.imagenesAdicionales) 
                ? producto.imagenesAdicionales 
                : producto.imagenesAdicionales.split(',');
                
            thumbnailsContainer.innerHTML = imagenes.map(img => `
                <img src="${img.trim()}" alt="Miniatura" class="thumbnail" onclick="cambiarImagenPrincipal('${img.trim()}')">
            `).join('');
        }

        // WhatsApp link
        const mensaje = `Hola! Estoy interesado en: ${producto.nombre} - ${window.location.href}`;
        document.getElementById('whatsappLink').href = 
            `https://wa.me/573043401416?text=${encodeURIComponent(mensaje)}`;

        // Productos relacionados (misma categoría, excluyendo el actual)
        const relacionados = productosGlobal.filter(p => 
            p.categoria === producto.categoria && 
            p.id !== producto.id
        ).slice(0, 4);
        
        mostrarProductosRelacionados(relacionados, 'relatedProducts');

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productTitle').textContent = "Error al cargar el producto";
    }
}

// 5. Función para cambiar imagen principal (si tienes thumbnails)
function cambiarImagenPrincipal(nuevaImagenUrl) {
    const imgPrincipal = document.getElementById('productImage');
    imgPrincipal.src = nuevaImagenUrl;
}

// 6. Función de inicialización
async function inicializar() {
    try {
        await mostrarDetalleProducto();
    } catch (error) {
        console.error('Error al inicializar:', error);
    }
}

// 7. Event listener para cuando se carga el DOM
document.addEventListener('DOMContentLoaded', inicializar);

// 8. Hacer la función disponible globalmente para los thumbnails
window.cambiarImagenPrincipal = cambiarImagenPrincipal;