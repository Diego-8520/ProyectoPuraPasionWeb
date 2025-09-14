// detalleProducto.js - Manejo de la página de detalle del producto
import { agregarAlCarrito } from './carritoCompras.js';
import { productosGlobal } from './estadoGlobal.js';

// 1. Configuración de la API
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
                <img src="${prod.imagenUrl || './Frontend/assets/img/default-product.jpg'}" alt="${prod.nombre}" class="product-image" />
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
        imgElement.src = producto.imagenUrl || './Frontend/assets/img/default-product.jpg';
        imgElement.alt = producto.nombre;

        // Thumbnails (si tienes imágenes adicionales en tu API)
        const thumbnailsContainer = document.getElementById('thumbnails');
        if (producto.imagenesAdicionales && producto.imagenesAdicionales.length > 0) {
            const imagenes = Array.isArray(producto.imagenesAdicionales) 
                ? producto.imagenesAdicionales 
                : producto.imagenesAdicionales.split(',');
                
            thumbnailsContainer.innerHTML = imagenes.map(img => `
                <img src="${img.trim()}" alt="Miniatura" class="thumbnail" onclick="cambiarImagenPrincipal('${img.trim()}')">
            `).join('');
        } else {
            thumbnailsContainer.innerHTML = '';
        }

        // WhatsApp link
        const mensaje = `Hola! Estoy interesado en: ${producto.nombre} - ${window.location.href}`;
        const whatsappLink = document.getElementById('whatsappLink');
        if (whatsappLink) {
            whatsappLink.href = `https://wa.me/573043401416?text=${encodeURIComponent(mensaje)}`;
        }

        // Configurar funcionalidad de carrito
        configurarCarritoDetalle(producto.id);

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

// 5. Configurar funcionalidad de carrito en página de detalle
function configurarCarritoDetalle(productoId) {
    const productActions = document.querySelector('.product-actions');
    
    // Crear contenedor de cantidad si no existe
    let quantityContainer = document.querySelector('.quantity-selector');
    if (!quantityContainer) {
        quantityContainer = document.createElement('div');
        quantityContainer.className = 'quantity-selector';
        quantityContainer.innerHTML = `
            <label for="productQuantity">Cantidad:</label>
            <div class="quantity-controls">
                <input type="number" id="productQuantity" value="1" min="1" max="30">
            </div>
        `;
        
        // Insertar antes de los botones de acción
        if (productActions) {
            productActions.parentNode.insertBefore(quantityContainer, productActions);
        }
    }

    // Crear o actualizar botón de agregar al carrito
    let addToCartBtn = document.querySelector('.add-to-cart-detail');
    if (!addToCartBtn) {
        addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'btn btn-primary add-to-cart-detail';
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar al Carrito';
        
        if (productActions) {
            productActions.appendChild(addToCartBtn);
        }
    }

    // Event listeners para controles de cantidad
    const quantityInput = document.getElementById('productQuantity');
    const decreaseBtn = document.querySelector('.quantity-btn.decrease');
    const increaseBtn = document.querySelector('.quantity-btn.increase');

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value) || 1;
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
    }

    // Event listener para botón de agregar al carrito
    if (addToCartBtn) {
        addToCartBtn.onclick = () => {
            const quantity = parseInt(quantityInput?.value) || 1;
            agregarAlCarrito(productoId, quantity);
        };
    }
}

// 6. Función para cambiar imagen principal
function cambiarImagenPrincipal(nuevaImagenUrl) {
    const imgPrincipal = document.getElementById('productImage');
    if (imgPrincipal) {
        imgPrincipal.src = nuevaImagenUrl;
        
        // Destacar la miniatura seleccionada
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.src === nuevaImagenUrl) {
                thumb.classList.add('active');
            }
        });
    }
}

// 7. Función de inicialización
async function inicializar() {
    try {
        await mostrarDetalleProducto();
    } catch (error) {
        console.error('Error al inicializar:', error);
    }
}

// 8. Event listener para cuando se carga el DOM
document.addEventListener('DOMContentLoaded', inicializar);

// 9. Hacer la función disponible globalmente para los thumbnails
window.cambiarImagenPrincipal = cambiarImagenPrincipal;