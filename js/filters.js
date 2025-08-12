document.addEventListener('DOMContentLoaded', () => {
    let originalInventoryData = []; // Datos originales sin filtrar
    let currentFilters = {
        etiquetado: '',
        status: '',
        pendingStatus: '',
        tipo: '',
        edificio: '',
        area: '',
        marca: '',
        resguardante: '',
        realizado: ''
    };

    // Función para normalizar texto (igual que en buscador.js)
    const normalizeText = (text) => {
        if (!text) return '';
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Función para establecer los datos originales (llamar desde script.js)
    window.setOriginalInventoryData = function(data) {
        originalInventoryData = data;
    };

    // Función para aplicar filtros
    function applyFilters() {
        let filteredData = [...originalInventoryData];

        // Filtro por etiquetado
        if (currentFilters.etiquetado && currentFilters.etiquetado !== 'Etiquetado') {
            filteredData = filteredData.filter(item => {
                const labelStatus = normalizeText(item.LabelStatus);
                if (currentFilters.etiquetado === 'si') {
                    return labelStatus === 'si' || labelStatus === 'etiquetado' || labelStatus === 'true';
                } else if (currentFilters.etiquetado === 'no') {
                    return labelStatus === 'no' || labelStatus === 'sin etiquetar' || labelStatus === 'false' || labelStatus === '' || labelStatus === 'no tiene';
                }
                return true;
            });
        }

        // Filtro por status
        if (currentFilters.status && currentFilters.status !== 'Status') {
            filteredData = filteredData.filter(item => {
                const status = normalizeText(item.Status);
                return status.includes(normalizeText(currentFilters.status));
            });
        }

        // Filtro por pending status (Check)
        if (currentFilters.pendingStatus && currentFilters.pendingStatus !== 'Check') {
            filteredData = filteredData.filter(item => {
                const pendingStatus = normalizeText(item.PendingStatus);
                return pendingStatus.includes(normalizeText(currentFilters.pendingStatus));
            });
        }

        // Filtro por realizado (Realizado)
        if (currentFilters.realizado && currentFilters.realizado !== 'Realizado') {
            filteredData = filteredData.filter(item => {
                const realizado = normalizeText(item.Realizado);
                if (currentFilters.realizado === 'si') {
                    return realizado === 'si' || realizado === 'realizado' || realizado === 'true';
                } else if (currentFilters.realizado === 'no') {
                    return realizado === 'no' || realizado === 'false' || realizado === '' || realizado === 'no tiene';
                }
                return true;
            });
        }

        // Filtro por tipo (categoría)
        if (currentFilters.tipo && currentFilters.tipo !== 'Tipo') {
            filteredData = filteredData.filter(item => {
                const categoryName = normalizeText(item.ProductDetails?.CategoryInfo?.category_name || '');
                return categoryName.includes(normalizeText(currentFilters.tipo));
            });
        }

        // Filtro por marca
        if (currentFilters.marca && currentFilters.marca !== 'Marca') {
            filteredData = filteredData.filter(item => {
                const brandName = normalizeText(item.ProductDetails?.BrandInfo?.brand_name || '');
                return brandName.includes(normalizeText(currentFilters.marca));
            });
        }

        // Filtro por edificio
        if (currentFilters.edificio && currentFilters.edificio !== 'Edificio') {
            filteredData = filteredData.filter(item => {
                const locationName = normalizeText(item.LocationInfo?.location_name || '');
                return locationName.includes(normalizeText(currentFilters.edificio));
            });
        }

        // Filtro por área
        if (currentFilters.area && currentFilters.area !== 'Área') {
            filteredData = filteredData.filter(item => {
                const labName = normalizeText(item.LabInfo?.lab_name || '');
                return labName.includes(normalizeText(currentFilters.area));
            });
        }

        // Filtro por resguardante
        if (currentFilters.resguardante && currentFilters.resguardante !== 'Resguardante') {
            filteredData = filteredData.filter(item => {
                const guardianName = normalizeText(item.GuardianInfo?.name || '');
                return guardianName.includes(normalizeText(currentFilters.resguardante));
            });
        }

        // Renderizar tabla filtrada
        if (window.renderTable) {
            window.renderTable(filteredData);
        } else {
            console.error('Función renderTable no disponible');
        }
    }

    // Event listener para el botón "Aplicar Filtros"
    document.getElementById('applyFilters')?.addEventListener('click', () => {
        // Obtener valores de los selects
        currentFilters.etiquetado = document.getElementById('filterEtiquetado').value;
        currentFilters.status = document.getElementById('filterStatus').value;
        currentFilters.pendingStatus = document.getElementById('filterPendingStatus').value;
        currentFilters.realizado = document.getElementById('filterRealizado').value;
        currentFilters.tipo = document.getElementById('filterTipo').value;
        currentFilters.marca = document.getElementById('filterMarca').value;
        currentFilters.edificio = document.getElementById('filterEdificio').value;
        currentFilters.area = document.getElementById('filterArea').value;
        currentFilters.resguardante = document.getElementById('filterResguardante').value;

        // Aplicar filtros
        applyFilters();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
        if (modal) {
            modal.hide();
        }

        // Mostrar indicador visual de filtros activos
        updateFilterIndicator();
    });

    // Función para mostrar indicador visual de filtros activos
    function updateFilterIndicator() {
        const filterButton = document.querySelector('button[data-bs-target="#filterModal"]');
        const activeFilters = Object.values(currentFilters).filter(value => 
            value && !['Etiquetado', 'Status', 'Check', 'Realizado', 'Tipo', 'Marca', 'Edificio', 'Área', 'Resguardante'].includes(value)
        );

        if (activeFilters.length > 0) {
            filterButton.classList.add('filter-active');
            filterButton.innerHTML = `<i class="fas fa-filter"></i> Filtrar (${activeFilters.length})`;
        } else {
            filterButton.classList.remove('filter-active');
            filterButton.innerHTML = '<i class="fas fa-filter"></i> Filtrar';
        }
    }

    // Función para restablecer filtros (función global)
    window.resetFilters = function() {
        // Restablecer valores de los selects
        document.getElementById('filterEtiquetado').selectedIndex = 0;
        document.getElementById('filterStatus').selectedIndex = 0;
        document.getElementById('filterPendingStatus').selectedIndex = 0;
        document.getElementById('filterRealizado').selectedIndex = 0;
        document.getElementById('filterTipo').selectedIndex = 0;
        document.getElementById('filterMarca').selectedIndex = 0;
        document.getElementById('filterEdificio').selectedIndex = 0;
        document.getElementById('filterArea').selectedIndex = 0;
        document.getElementById('filterResguardante').selectedIndex = 0;

        // Restablecer objeto de filtros
        currentFilters = {
            etiquetado: '',
            status: '',
            pendingStatus: '',
            realizado: '',
            tipo: '',
            marca: '',
            edificio: '',
            area: '',
            resguardante: ''
        };

        // Limpiar búsqueda también
        const searchInput = document.getElementById('busquedaInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Renderizar tabla original
        if (window.renderTable && originalInventoryData.length > 0) {
            window.renderTable(originalInventoryData);
        }

        // Actualizar indicador visual
        updateFilterIndicator();

        // Mostrar mensaje de confirmación
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Filtros restablecidos',
                text: 'Todos los filtros han sido limpiados',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    // Función para llenar dinámicamente las opciones de los filtros
    function populateFilterOptions() {
        if (originalInventoryData.length === 0) return;

        // Obtener valores únicos para cada filtro
        const edificios = [...new Set(originalInventoryData.map(item => item.LocationInfo?.location_name).filter(Boolean))];
        const areas = [...new Set(originalInventoryData.map(item => item.LabInfo?.lab_name).filter(Boolean))];
        const tipos = [...new Set(originalInventoryData.map(item => item.ProductDetails?.CategoryInfo?.category_name).filter(Boolean))];
        const marcas = [...new Set(originalInventoryData.map(item => item.ProductDetails?.BrandInfo?.brand_name).filter(Boolean))];
        const resguardantes = [...new Set(originalInventoryData.map(item => item.GuardianInfo?.name).filter(Boolean))];
        const statusList = [...new Set(originalInventoryData.map(item => item.Status).filter(Boolean))];
        const pendingStatusList = [...new Set(originalInventoryData.map(item => item.PendingStatus).filter(Boolean))];

        // Llenar select de edificios
        populateSelect('filterEdificio', edificios);
        
        // Llenar select de áreas
        populateSelect('filterArea', areas);
        
        // Llenar select de tipos
        populateSelect('filterTipo', tipos);
        
        // Llenar select de marcas
        populateSelect('filterMarca', marcas);
        
        // Llenar select de resguardantes
        populateSelect('filterResguardante', resguardantes);
        
        // Llenar select de status
        populateSelect('filterStatus', statusList);
        
        // Llenar select de pending status
        populateSelect('filterPendingStatus', pendingStatusList);
    }

    // Función auxiliar para poblar selects
    function populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (select) {
            // Mantener primera opción (placeholder)
            const firstOption = select.children[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            options.sort().forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.toLowerCase();
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
        }
    }

    // Función global para actualizar filtros cuando cambien los datos
    window.updateFiltersData = function(data) {
        originalInventoryData = data;
        populateFilterOptions();
    };

    // Integración con búsqueda - modificar búsqueda para trabajar con filtros
    const originalSearch = window.limpiarBusqueda;
    window.limpiarBusqueda = function() {
        const searchInput = document.getElementById('busquedaInput');
        if (searchInput) {
            searchInput.value = '';
            // Si hay filtros activos, aplicar filtros sin búsqueda
            const hasActiveFilters = Object.values(currentFilters).some(value => 
                value && !['Etiquetado', 'Status', 'Check', 'Realizado', 'Tipo', 'Marca', 'Edificio', 'Área', 'Resguardante'].includes(value)
            );
            
            if (hasActiveFilters) {
                applyFilters();
            } else if (window.renderTable && originalInventoryData.length > 0) {
                window.renderTable(originalInventoryData);
            }
        }
    };

    // CSS para indicador visual de filtros activos
    const style = document.createElement('style');
    style.textContent = `
        .filter-active {
            background-color: #0d6efd !important;
            color: white !important;
            border-color: #0d6efd !important;
        }
        .filter-active:hover {
            background-color: #0b5ed7 !important;
            border-color: #0a58ca !important;
        }
        
        /* Mejorar el modal de filtros */
        #filterModal .modal-body {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .filter-section {
            margin-bottom: 1rem;
        }
        
        .filter-section h6 {
            color: #495057;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .filter-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
    `;
    document.head.appendChild(style);
});