import { aplicarFiltros } from './funcionesWeb.js';

// 1. Configuración de la API
const API_URL = 'https://localhost:7272/api'; // API local
export let productosGlobal = [];

// 2. Función principal para cargar productos
export async function cargarProductos() {
    try {
        // 2.1. Hacer la petición a tu endpoint .NET
        const response = await fetch(`${API_URL}/Productos`); // Cambiado a tu endpoint
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        // 2.2. Procesar la respuesta
        const productos = await response.json();
        productosGlobal = productos;

        // 2.3. Actualizar la UI
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

    // 3.2. Generar las tarjetas de productos
    contenedor.innerHTML = productos.map(prod => `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${prod.imagenUrl || 'img/default-product.jpg'}" 
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
                </div>
            </div>
        </div>
    `).join('');
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

// 5. Función para mostrar errores
function mostrarError() {
    document.getElementById('nuestroCatalogo').innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar los productos. Intenta recargar la página.</p>
            <button onclick="location.reload()" class="btn btn-small">Reintentar</button>
        </div>
    `;
}