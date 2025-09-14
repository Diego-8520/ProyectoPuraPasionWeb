// estadoGlobal.js - Estado global compartido entre módulos
export let productosGlobal = [];
export let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para guardar el carrito en localStorage y actualizar el estado global
export function guardarCarrito(nuevoCarrito) {
    carrito = nuevoCarrito;
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (error) {
        console.error('Error al guardar carrito:', error);
    }
}

// Función para actualizar el contador del carrito en todas las páginas
export function actualizarContadorGlobal() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contadores = document.querySelectorAll('.cart-count');
    contadores.forEach(contador => {
        contador.textContent = totalItems;
    });
}