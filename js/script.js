document.addEventListener('DOMContentLoaded', () => {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    let allInventoryData = []; // Todos los datos del inventario
    let filteredData = []; // Datos después de aplicar filtros y búsqueda
    let displayedData = []; // Datos mostrados actualmente
    let currentPage = 0; // Página actual para el lazy loading
    const itemsPerPage = 20; // Cantidad de elementos por página
    let isLoading = false; // Flag para evitar múltiples cargas simultáneas

    // Crear pantalla de carga overlay
    // Crear pantalla de carga overlay mejorada
function createLoadingScreen() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="loading-container">
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <h3 class="loading-title">Cargando Inventario</h3>
                <p class="loading-text" id="loadingText">Conectando con el servidor...</p>
                <div class="loading-progress">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="loading-stats" id="loadingStats">
                    <span>Preparando datos...</span>
                </div>
            </div>
        </div>
    `;

    // Agregar estilos de la pantalla de carga mejorada
    const loadingStyles = document.createElement('style');
    loadingStyles.textContent = `
        #loadingOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.4s ease-out;
        }

        .loading-container {
            text-align: center;
            color: #495057;
            max-width: 400px;
            padding: 2rem;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }

        .loading-spinner {
            margin: 0 auto 1.5rem;
            width: 60px;
            height: 60px;
        }

        .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e9ecef;
            border-top: 4px solid var(--primary-green);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #343a40;
        }

        .loading-text {
            font-size: 1rem;
            color: #6c757d;
            margin-bottom: 1.5rem;
            min-height: 24px;
        }

        .loading-progress {
            width: 100%;
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-green), var(--primary-green-dark));
            border-radius: 3px;
            width: 0%;
            transition: width 0.3s ease;
            position: relative;
        }

        .progress-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .loading-stats {
            font-size: 0.9rem;
            color: #6c757d;
            min-height: 20px;
        }

        .fade-out {
            opacity: 0 !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .loading-container {
                max-width: 300px;
                padding: 1.5rem;
            }
            
            .loading-title {
                font-size: 1.3rem;
            }
            
            .spinner {
                width: 50px;
                height: 50px;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
            }
        }
    `;
    document.head.appendChild(loadingStyles);

    document.body.appendChild(loadingOverlay);
    return loadingOverlay;
}

// Actualizar progreso de carga (sin cambios)
function updateLoadingProgress(progress, text, stats) {
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const loadingStats = document.getElementById('loadingStats');

    if (loadingText) loadingText.textContent = text;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (loadingStats && stats) loadingStats.textContent = stats;
}

// Remover pantalla de carga (sin cambios)
function removeLoadingScreen() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
        }, 400);
    }
}

    // Función para obtener todos los datos del inventario
    async function fetchAllInventoryData() {
        const loadingScreen = createLoadingScreen();

        try {
            updateLoadingProgress(10, 'Conectando con el servidor...', 'Estableciendo conexión...');

            // Hacer ambas peticiones en paralelo
            updateLoadingProgress(20, 'Descargando datos...', 'Obteniendo información de productos...');

            const [unitsResponse, productsResponse] = await Promise.all([
                fetch('https://healtyapi.bsite.net/api/product_units'),
                fetch('https://healtyapi.bsite.net/api/inventories')
            ]);

            updateLoadingProgress(40, 'Validando datos...', 'Verificando integridad de datos...');

            if (!unitsResponse.ok) {
                throw new Error('Error en product_units: ' + unitsResponse.statusText);
            }
            if (!productsResponse.ok) {
                throw new Error('Error en inventories: ' + productsResponse.statusText);
            }

            updateLoadingProgress(50, 'Procesando información...', 'Parseando datos del servidor...');

            const unitsData = await unitsResponse.json();
            const productsData = await productsResponse.json();

            updateLoadingProgress(60, 'Organizando inventario...', `Procesando ${unitsData.length} unidades...`);

            if (Array.isArray(unitsData) && Array.isArray(productsData)) {
                // Filtrar solo los que tienen status "activo"
                updateLoadingProgress(70, 'Filtrando datos activos...', 'Aplicando filtros de estado...');

                const activos = unitsData.filter(item => 
                    item.Status && item.Status.toLowerCase() === 'activo'
                );

                updateLoadingProgress(80, 'Combinando información...', `${activos.length} elementos activos encontrados`);

                // Crear un mapa de productos para búsqueda rápida por id_product
                const productsMap = new Map();
                productsData.forEach(product => {
                    productsMap.set(product.id_product, product);
                });

                // Combinar datos de units con datos de productos
                const combinedData = activos.map(unit => {
                    const productDetails = productsMap.get(unit.ProductInfo.id_product);
                    return {
                        ...unit,
                        ProductDetails: productDetails || null
                    };
                });

                updateLoadingProgress(90, 'Finalizando preparación...', 'Ordenando datos...');

                // Ordenar los productos por id_product
                combinedData.sort((a, b) => {
                    return a.ProductInfo.id_product - b.ProductInfo.id_product;
                });

                updateLoadingProgress(95, 'Inicializando tabla...', 'Preparando interfaz...');

                allInventoryData = combinedData;
                filteredData = [...combinedData];
                
                // Enviar datos a sistema de filtros
                if (window.setOriginalInventoryData) {
                    window.setOriginalInventoryData(combinedData);
                }
                if (window.updateFiltersData) {
                    window.updateFiltersData(combinedData);
                }

                updateLoadingProgress(100, '¡Carga completada!', `${combinedData.length} elementos listos para mostrar`);

                // Pequeña pausa para mostrar el 100%
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Remover pantalla de carga
                removeLoadingScreen();
                
                // Inicializar lazy loading de renderizado
                resetPagination();
                loadMoreItems();

            } else {
                throw new Error("Una o ambas respuestas no son arrays");
            }
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            updateLoadingProgress(0, 'Error en la carga', 'Hubo un problema al cargar los datos');
            
            setTimeout(() => {
                removeLoadingScreen();
                showErrorMessage();
            }, 2000);
        }
    }

    // Función para resetear la paginación de renderizado
    function resetPagination() {
        currentPage = 0;
        displayedData = [];
        inventoryTableBody.innerHTML = '';
    }

    // Función para cargar más elementos en el renderizado (lazy rendering)
    function loadMoreItems() {
        if (isLoading) return;

        const startIndex = currentPage * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        
        if (startIndex >= filteredData.length) {
            return; // No hay más datos que renderizar
        }

        isLoading = true;
        
        // Solo mostrar loading indicator si no es la primera carga
        if (currentPage > 0) {
            showLoadingIndicator();
        }

        // Simular procesamiento asíncrono para no bloquear la UI
        setTimeout(() => {
            const newItems = filteredData.slice(startIndex, endIndex);
            displayedData = [...displayedData, ...newItems];
            
            hideLoadingIndicator();
            renderNewItems(newItems);
            
            currentPage++;
            isLoading = false;
        }, 50);
    }

    // Función para mostrar indicador de carga de más elementos
    function showLoadingIndicator() {
        const existingLoader = document.getElementById('lazyLoadIndicator');
        if (!existingLoader) {
            const loadingRow = document.createElement('tr');
            loadingRow.id = 'lazyLoadIndicator';
            loadingRow.innerHTML = `
                <td colspan="8" class="text-center p-3">
                    <div class="d-flex justify-content-center align-items-center">
                        <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <span class="text-muted">Cargando más elementos...</span>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(loadingRow);
        }
    }

    // Función para ocultar indicador de carga
    function hideLoadingIndicator() {
        const loader = document.getElementById('lazyLoadIndicator');
        if (loader) {
            loader.remove();
        }
    }

    // Función para mostrar mensaje de error
    function showErrorMessage() {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center p-4">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h5 class="text-danger">Error al cargar datos</h5>
                        <p class="text-muted">Hubo un problema al cargar el inventario. Intenta recargar la página.</p>
                        <button class="btn btn-primary mt-2" onclick="location.reload()">
                            <i class="fas fa-refresh me-2"></i>Recargar página
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Función para crear div de atributos
    function createAttributeDiv(label, value) {
        if (!value || value.trim() === '') value = 'No tiene';
        return `<div><strong>${label}:</strong> <span>${value}</span></div>`;
    }

    // Función para renderizar nuevos elementos (agregar al final)
    function renderNewItems(newItems) {
        newItems.forEach(item => {
            createItemRow(item);
        });
    }

    // Función para crear una fila de elemento
    function createItemRow(item) {
        const row = document.createElement('tr');
        row.classList.add('item-row');
        row.setAttribute('data-id', item.id_unit);

        // Asignamos las clases de estado
        const statusLower = item.Status.toLowerCase();
        const statusClass = statusLower === 'activo' ? 'status-good' : 'status-pending';
        const checkLower = item.PendingStatus.toLowerCase();
        const checkClass = checkLower === 'pendiente' ? 'status-pending' : 'status-good';

        row.innerHTML = `
            <td><input type="checkbox" class="checkbox-select"></td>
            <td class="col-id">${item.id_unit}</td>
            <td class="col-articulo">${item.ProductInfo.name}</td>
            <td>${item.ProductInfo.model}</td>
            <td>${item.LocationInfo.location_name}</td>
            <td>${item.LabInfo.lab_name}</td>
            <td><span class="badge-status ${statusClass}">${item.Status}</span></td>
            <td><span class="badge-status ${checkClass}">${item.PendingStatus}</span></td>
        `;

        inventoryTableBody.appendChild(row);

        // Obtener marca del ProductDetails
        const brandName = item.ProductDetails?.BrandInfo?.brand_name || 'No especificada';
        
        // Fila expandible con más detalles
        const expandableRow = document.createElement('tr');
        expandableRow.classList.add('expandable-row');
        expandableRow.style.display = 'none';
        expandableRow.innerHTML = `
            <td colspan="8">
                <div class="expandable-content">
                  <div class="expandable-attributes">
                    ${createAttributeDiv('Etiquetado', item.LabelStatus)}
                    ${createAttributeDiv('Tipo', item.ProductDetails?.CategoryInfo?.category_name || 'No especificado')}
                    ${createAttributeDiv('Marca', brandName)}
                    ${createAttributeDiv('Resguardante', item.GuardianInfo.name)}
                    ${createAttributeDiv('Observaciones', item.observations || item.ProductDetails?.description || 'Sin observaciones')}
                  </div>
                </div>
            </td>
        `;
        inventoryTableBody.appendChild(expandableRow);

        // Evento para desplegar/colapsar fila expandible
        row.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                expandableRow.style.display = expandableRow.style.display === 'none' ? 'table-row' : 'none';
            }
        });
    }

    // Función global para renderizar tabla (compatibilidad con filtros externos)
    window.renderTable = function renderTable(data) {
        filteredData = data;
        resetPagination();

        if (data.length === 0) {
            // Mostrar mensaje cuando no hay resultados
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="8" class="text-center p-4">
                    <div class="no-results">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No se encontraron resultados</h5>
                        <p class="text-muted">Intenta ajustar tus filtros o términos de búsqueda</p>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(noResultsRow);
            return;
        }

        loadMoreItems();
    }

    // Función de búsqueda
    function searchTable() {
        const input = document.getElementById('busquedaInput');
        if (!input) {
            console.error("Elemento de búsqueda no encontrado");
            return;
        }
        
        const filter = input.value.toUpperCase();
        
        // Obtener datos base (pueden ser datos filtrados o datos originales)
        let baseData = allInventoryData;
        
        // Si hay filtros activos, obtener los datos filtrados actuales
        if (window.getFilteredData) {
            baseData = window.getFilteredData();
        }
        
        // Aplicar búsqueda sobre los datos base
        const searchedData = baseData.filter(item => 
            item.id_unit.toString().includes(filter) || 
            item.ProductInfo.name.toUpperCase().includes(filter)
        );
        
        window.renderTable(searchedData);
    }

    // Detector de scroll para lazy rendering
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        
        // Cargar más elementos cuando el usuario esté cerca del final
        if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
            if (displayedData.length < filteredData.length) {
                loadMoreItems();
            }
        }
    }

    // Throttle function para optimizar el scroll
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // Event listeners
    window.addEventListener('scroll', throttle(handleScroll, 100));

    const searchInput = document.getElementById('busquedaInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchTable);
    }

    // Función para limpiar búsqueda
    window.limpiarBusqueda = function() {
        const searchInput = document.getElementById('busquedaInput');
        if (searchInput) {
            searchInput.value = '';
            window.renderTable(allInventoryData);
        }
    }

    // Funciones globales para compatibilidad
    window.getInventoryData = function() {
        return allInventoryData;
    }

    window.getFilteredData = function() {
        return filteredData;
    }

    window.getDisplayedData = function() {
        return displayedData;
    }

    // Inicializar carga de datos
    fetchAllInventoryData();
});