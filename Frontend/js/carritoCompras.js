// carritoCompras.js - Manejo del carrito de compras
import { cargarProductos } from './cargueInventario.js';
import { mostrarMensaje } from './funcionesWeb.js';
import { productosGlobal, carrito, guardarCarrito, actualizarContadorGlobal } from './estadoGlobal.js';

// 1. Configuración de la API
const API_URL = 'https://localhost:7272/api';

// 2. Función para obtener el carrito (usa la variable global directamente)
function obtenerCarrito() {
    return carrito;
}

// 3. Función para mostrar los productos en el carrito
export async function mostrarCarrito() {
    const emptyCart = document.getElementById('emptyCart');
    const cartWithItems = document.getElementById('cartWithItems');
    
    // Solo ejecutar si estamos en la página del carrito
    if (!emptyCart || !cartWithItems) return;
    
    // Cargar productos si es necesario
    if (productosGlobal.length === 0) {
        await cargarProductos();
    }
    
    const carritoContainer = document.getElementById('carritoContainer');
    const subtotalElement = document.getElementById('subtotal');
    const totalContainer = document.getElementById('totalContainer');
    const carritoActual = obtenerCarrito();
    
    // Mostrar estado vacío o con productos
    if (carritoActual.length === 0) {
        emptyCart.style.display = 'block';
        cartWithItems.style.display = 'none';
        actualizarContadorGlobal();
        return;
    }
    
    emptyCart.style.display = 'none';
    cartWithItems.style.display = 'block';
    
    // Generar HTML de los productos
    carritoContainer.innerHTML = '';
    let subtotal = 0;

    carritoActual.forEach(item => {
        const producto = productosGlobal.find(p => p.id == item.productoId);
        if (producto) {
            const itemTotal = producto.precio * item.cantidad;
            subtotal += itemTotal;
            
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
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
    if (totalContainer) totalContainer.textContent = `$${subtotal.toLocaleString()}`;
    actualizarContadorGlobal();

    // Agregar event listeners
    agregarEventListenersCarrito();
}

// 4. Función para agregar event listeners a los botones del carrito
function agregarEventListenersCarrito() {
    // Botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productoId = parseInt(e.currentTarget.getAttribute('data-id'));
            eliminarDelCarrito(productoId);
        });
    });

    // Botones de cantidad (aumentar/disminuir)
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productoId = parseInt(e.currentTarget.getAttribute('data-id'));
            const action = e.currentTarget.getAttribute('data-action');
            actualizarCantidad(productoId, action);
        });
    });

    // Botón de checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', procederAlPago);
    }
}

// 5. Función para eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    const nuevoCarrito = carrito.filter(item => item.productoId !== productoId);
    guardarCarrito(nuevoCarrito);
    mostrarMensaje('Producto eliminado del carrito');
    mostrarCarrito(); // Actualizar la vista
}

// 6. Función para actualizar cantidad
function actualizarCantidad(productoId, action) {
    const nuevoCarrito = [...carrito];
    const itemIndex = nuevoCarrito.findIndex(item => item.productoId === productoId);
    
    if (itemIndex !== -1) {
        if (action === 'increase') {
            nuevoCarrito[itemIndex].cantidad += 1;
        } else if (action === 'decrease') {
            if (nuevoCarrito[itemIndex].cantidad > 1) {
                nuevoCarrito[itemIndex].cantidad -= 1;
            } else {
                // Si la cantidad es 1 y se quiere disminuir, eliminar el producto
                nuevoCarrito.splice(itemIndex, 1);
                mostrarMensaje('Producto eliminado del carrito');
            }
        }
        guardarCarrito(nuevoCarrito);
        mostrarCarrito(); // Actualizar la vista
    }
}

// 7. Función para proceder al pago (WhatsApp)
function procederAlPago() {
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

// 8. Función para calcular el total del carrito
function calcularTotalCarrito() {
    return carrito.reduce((total, item) => {
        const producto = productosGlobal.find(p => p.id == item.productoId);
        return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
}

// 9. Función para agregar productos al carrito
export function agregarAlCarrito(productoId, cantidad = 1) {
    const nuevoCarrito = [...carrito];
    const itemIndex = nuevoCarrito.findIndex(item => item.productoId === productoId);
    
    if (itemIndex !== -1) {
        nuevoCarrito[itemIndex].cantidad += cantidad;
    } else {
        nuevoCarrito.push({ productoId, cantidad });
    }
    
    guardarCarrito(nuevoCarrito);
    actualizarContadorGlobal();
    mostrarMensaje('Producto agregado al carrito');
}

// 10. Inicialización del carrito
function inicializarCarrito() {
    const emptyCart = document.getElementById('emptyCart');
    if (emptyCart) {
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                if (productosGlobal.length === 0) {
                    await cargarProductos();
                }
                mostrarCarrito();
            } catch (error) {
                console.error('Error en inicialización:', error);
            }
        });
    }
}

// Inicializar siempre el contador global
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorGlobal();
});

inicializarCarrito();

// Exportar funciones para uso en otros módulos
export { obtenerCarrito, guardarCarrito };