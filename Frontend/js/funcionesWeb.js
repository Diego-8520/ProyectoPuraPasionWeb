import { productosGlobal, mostrarProductos } from './cargueInventario.js';

function limpiarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export function aplicarFiltros() {
    const inputBusqueda = document.getElementById('inputBusquedaNombre');
    const botonBuscar = document.getElementById('buscarProducto');
    const selectCategoria = document.getElementById('filtroCategoria');

    /**
     * Filtra productos según texto y categoría
     */
    const filtrarTodo = () => {
        const texto = limpiarTexto(inputBusqueda.value);
        const categoria = selectCategoria.value;

        const filtrados = productosGlobal.filter(producto => {
            const coincideTexto = limpiarTexto(producto.nombre).includes(texto);
            const coincideCategoria = categoria === 'todos' || producto.categoria === categoria;
            return coincideTexto && coincideCategoria;
        });

        mostrarProductos(filtrados);  // Renderiza resultados
    };

    // Event listeners (búsqueda en tiempo real y por botón)
    inputBusqueda.addEventListener('input', filtrarTodo);
    botonBuscar.addEventListener('click', filtrarTodo);
    selectCategoria.addEventListener('change', filtrarTodo);
}

// Manejo del menú móvil
export function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && mainNav) {
        // Función para alternar el menú
        const toggleMenu = () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.innerHTML = mainNav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        };

        // Evento para el botón móvil
        mobileMenuBtn.addEventListener('click', toggleMenu);

        // Eventos para los enlaces de navegación
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }
}