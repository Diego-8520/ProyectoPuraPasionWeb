// carritoCompras.js - Manejo del carrito de compras
import { productosGlobal, cargarProductos } from './cargueInventario.js';
import { actualizarContadorCarrito, mostrarMensaje } from './funcionesWeb.js';

// 1. Configuración de la API
const API_URL = 'https://localhost:7272/api';

// 2. Función para cargar productos si es necesario
async function cargarProductosSiEsNecesario() {
    if (productosGlobal.length === 0) {
        try {
            const response = await fetch(`${API_URL}/Productos`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const productos = await response.json();
            productosGlobal.splice(0, productosGlobal.length, ...productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            mostrarMensaje('Error al cargar productos', 'error');
        }
    }
    return productosGlobal;
}

// 3. Función para mostrar los productos en el carrito
export async function mostrarCarrito() {
    // Verificar si estamos en la página del carrito
    const emptyCart = document.getElementById('emptyCart');
    const cartWithItems = document.getElementById('cartWithItems');
    
    // Si no estamos en la página del carrito, salir
    if (!emptyCart || !cartWithItems) {
        return;
    }
    
    await cargarProductosSiEsNecesario();
    
    const carritoContainer = document.getElementById('carritoContainer');
    const subtotalElement = document.getElementById('subtotal');
    const totalContainer = document.getElementById('totalContainer');
    
    const carrito = obtenerCarrito();
    
    // Mostrar estado vacío o con productos
    if (carrito.length === 0) {
        emptyCart.style.display = 'block';
        cartWithItems.style.display = 'none';
        actualizarContadorCarrito(0);
        return;
    }
    
    emptyCart.style.display = 'none';
    cartWithItems.style.display = 'block';
    
    // Generar HTML de los productos
    carritoContainer.innerHTML = '';
    let subtotal = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        const producto = productosGlobal.find(p => p.id == item.productoId);
        if (producto) {
            const itemTotal = producto.precio * item.cantidad;
            subtotal += itemTotal;
            totalItems += item.cantidad;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div class="cart-item-image">
                    <img src="${producto.imagenUrl || './Frontend/assets/img/default-product.jpg'}" 
                alt="${producto.nombre}" />
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${producto.nombre}</h4>
                    <p class="cart-item-category">${producto.categoria}</p>
                    <p class="cart-item-price">$${producto.precio.toLocaleString()}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-id="${producto.id}" data-action="decrease">-</button>
                    <span class="quantity-number">${item.cantidad}</span>
                    <button class="quantity-btn" data-id="${producto.id}" data-action="increase">+</button>
                </div>
                <div class="cart-item-total">
                    <span>$${itemTotal.toLocaleString()}</span>
                </div>
                <button class="remove-btn" data-id="${producto.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            carritoContainer.appendChild(itemDiv);
        }
    });

    // Actualizar totales
    subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
    totalContainer.textContent = `$${subtotal.toLocaleString()}`;
    actualizarContadorCarrito(totalItems);

    // Agregar event listeners
    agregarEventListenersCarrito();
}

// 4. Función para obtener el carrito del localStorage
function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        return [];
    }
}

// 5. Función para guardar el carrito en localStorage
function guardarCarrito(carrito) {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (error) {
        console.error('Error al guardar carrito:', error);
    }
}

// 6. Función para agregar event listeners a los botones del carrito
function agregarEventListenersCarrito() {
    // Botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productoId = parseInt(e.currentTarget.getAttribute('data-id'));
            eliminarDelCarrito(productoId);
            mostrarCarrito();
        });
    });

    // Botones de cantidad (aumentar/disminuir)
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productoId = parseInt(e.currentTarget.getAttribute('data-id'));
            const action = e.currentTarget.getAttribute('data-action');
            actualizarCantidad(productoId, action);
            mostrarCarrito();
        });
    });

    // Botón de checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', procederAlPago);
    }
}

// 7. Función para eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.productoId !== productoId);
    guardarCarrito(carrito);
    mostrarMensaje('Producto eliminado del carrito');
}

// 8. Función para actualizar cantidad
function actualizarCantidad(productoId, action) {
    let carrito = obtenerCarrito();
    const itemIndex = carrito.findIndex(item => item.productoId === productoId);
    
    if (itemIndex !== -1) {
        if (action === 'increase') {
            carrito[itemIndex].cantidad += 1;
        } else if (action === 'decrease') {
            if (carrito[itemIndex].cantidad > 1) {
                carrito[itemIndex].cantidad -= 1;
            } else {
                // Si la cantidad es 1 y se quiere disminuir, eliminar el producto
                carrito.splice(itemIndex, 1);
                mostrarMensaje('Producto eliminado del carrito');
            }
        }
        guardarCarrito(carrito);
    }
}

// 9. Función para proceder al pago (WhatsApp)
function procederAlPago() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        mostrarMensaje('El carrito está vacío', 'error');
        return;
    }

    // Crear mensaje para WhatsApp
    let mensaje = "¡Hola! Estoy interesado en los siguientes productos:\n\n";
    
    carrito.forEach(item => {
        const producto = productosGlobal.find(p => p.id == item.productoId);
        if (producto) {
            mensaje += `• ${producto.nombre} - Cantidad: ${item.cantidad} - $${producto.precio * item.cantidad}\n`;
        }
    });

    mensaje += `\nTotal: $${calcularTotalCarrito().toLocaleString()}\n`;
    mensaje += `\nEnlace al carrito: ${window.location.href}`;

    // Abrir WhatsApp
    window.open(`https://wa.me/573043401416?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// 10. Función para calcular el total del carrito
function calcularTotalCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => {
        const producto = productosGlobal.find(p => p.id == item.productoId);
        return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
}

// 11. Función para mostrar errores
function mostrarError(mensaje) {
    const carritoContainer = document.getElementById('carritoContainer');
    if (carritoContainer) {
        carritoContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${mensaje}</p>
                <button onclick="location.reload()" class="btn btn-small">Reintentar</button>
            </div>
        `;
    }
}

// 12. Inicialización del carrito - SOLO en la página del carrito
function inicializarCarrito() {
    const emptyCart = document.getElementById('emptyCart');
    const cartWithItems = document.getElementById('cartWithItems');
    
    // Solo inicializar si estamos en la página del carrito
    if (emptyCart && cartWithItems) {
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                if (productosGlobal.length === 0) {
                    await cargarProductos();
                }
                mostrarCarrito();
            } catch (error) {
                console.error('Error en inicialización:', error);
                mostrarError('Error al cargar la página');
            }
        });
    }
}

// 13. Función para agregar productos al carrito (para usar desde otras páginas)
function agregarAlCarrito(productoId, cantidad = 1) {
    let carrito = obtenerCarrito();
    const itemIndex = carrito.findIndex(item => item.productoId === productoId);
    
    if (itemIndex !== -1) {
        // Producto ya existe, actualizar cantidad
        carrito[itemIndex].cantidad += cantidad;
    } else {
        // Producto nuevo, agregar al carrito
        carrito.push({ productoId, cantidad });
    }
    
    guardarCarrito(carrito);
    actualizarContadorCarrito(calcularTotalItems());
    mostrarMensaje('Producto agregado al carrito');
}

// 14. Función para calcular el total de items en el carrito
function calcularTotalItems() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

// 15. Exportar funciones para uso en otros módulos
export { obtenerCarrito, guardarCarrito, agregarAlCarrito };

// 16. Inicializar el carrito solo si estamos en la página correcta
inicializarCarrito();