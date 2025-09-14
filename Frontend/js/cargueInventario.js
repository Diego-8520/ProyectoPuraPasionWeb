import { aplicarFiltros, setupMobileMenu } from './funcionesWeb.js';
import { agregarAlCarrito } from './carritoCompras.js';
import { productosGlobal } from './estadoGlobal.js';

// 1. Configuración de la API
const API_URL = 'https://localhost:7272/api'; // API local

// 2. Función principal para cargar productos
export async function cargarProductos() {
    try {
        // 2.1. Hacer la petición a tu endpoint .NET
        const response = await fetch(`${API_URL}/Productos`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        // 2.2. Procesar la respuesta
        const productos = await response.json();
        
        // 2.3. Actualizar el array global SIN reasignar la variable
        productosGlobal.length = 0; // Vaciar el array existente
        productosGlobal.push(...productos); // Agregar los nuevos productos

        // 2.4. Actualizar la UI
        llenarOpcionesCategoria(productos);
        mostrarProductos(productos);
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarError();
    }
}


// 3. Función para mostrar productos en el HTML
export function mostrarProductos(productos) {
    const contenedor = document.getElementById('nuestroCatalogo');
    
    // 3.1. Manejo cuando no hay productos
    if (!productos || productos.length === 0) {
        contenedor.innerHTML = `
            <div class="no-products">
                <i class="far fa-futbol"></i>
                <p>No encontramos productos disponibles.</p>
            </div>
        `;
        return;
    }

    // 3.2. Generar las tarjetas de productos con botón de carrito
    contenedor.innerHTML = productos.map(prod => `
        <div class="product-card" data-product-id="${prod.id}">
            <div class="product-image-container">
                <img src="${prod.imagenUrl || './Frontend/assets/img/default-product.jpg'}" 
                     alt="${prod.nombre}" 
                     class="product-image">
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
                    <!-- Botón principal de agregar al carrito -->
                    <button class="btn btn-primary btn-small add-to-cart-btn" 
                            data-product-id="${prod.id}">
                        <i class="fas fa-shopping-cart"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // 3.3. Agregar event listeners a los botones de carrito
    agregarEventListenersCarrito();
}

// 4. Función para llenar el dropdown de categorías
function llenarOpcionesCategoria(productos) {
    const select = document.getElementById('filtroCategoria');
    
    // 4.1. Opción por defecto
    select.innerHTML = '<option value="todos">Todas las categorías</option>';
    
    // 4.2. Obtener categorías únicas
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))].sort();
    
    // 4.3. Añadir opciones al select
    categoriasUnicas.forEach(categoria => {
        select.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
}

// 5. Función para agregar event listeners a los botones de carrito
function agregarEventListenersCarrito() {
    // Botones principales de agregar al carrito
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
            agregarAlCarrito(productId);
        });
    });

    // Botones de agregado rápido (en la imagen)
    document.querySelectorAll('.quick-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita que se active el link de la card
            const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
            agregarAlCarrito(productId);
        });
    });
}

// 6. Función para mostrar errores
function mostrarError() {
    document.getElementById('nuestroCatalogo').innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar los productos. Intenta recargar la página.</p>
            <button onclick="location.reload()" class="btn btn-small">Reintentar</button>
        </div>
    `;
}