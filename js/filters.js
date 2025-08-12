document.addEventListener('DOMContentLoaded', () => {
    const applyFiltersButton = document.getElementById('applyFilters');
    const resetButton = document.getElementById('resetFilters');
    const filterForm = document.getElementById('filterForm');

    // Función para aplicar los filtros
    function applyFilters() {
        const filters = {
            etiquetado: document.getElementById('filterEtiquetado').value,
            status: document.getElementById('filterStatus').value,
            tipo: document.getElementById('filterTipo').value,
            edificio: document.getElementById('filterEdificio').value,
            area: document.getElementById('filterArea').value,
        };

        let filteredData = inventoryData;

        // Filtrar los datos
        if (filters.etiquetado !== 'Etiquetado') {
            filteredData = filteredData.filter(item => item.LabelStatus.toLowerCase() === filters.etiquetado.toLowerCase());
        }
        if (filters.status !== 'Status') {
            filteredData = filteredData.filter(item => item.Status.toLowerCase() === filters.status.toLowerCase());
        }
        if (filters.tipo !== 'Tipo') {
            filteredData = filteredData.filter(item => item.ProductDetails?.CategoryInfo?.category_name.toLowerCase() === filters.tipo.toLowerCase());
        }
        if (filters.edificio !== 'Edificio') {
            filteredData = filteredData.filter(item => item.LocationInfo.location_name.toLowerCase() === filters.edificio.toLowerCase());
        }
        if (filters.area !== 'Área') {
            filteredData = filteredData.filter(item => item.LabInfo.lab_name.toLowerCase() === filters.area.toLowerCase());
        }

        renderTable(filteredData);
    }

    // Función para restablecer los filtros
    function resetFilters() {
        filterForm.reset();
        renderTable(inventoryData); // Mostrar todos los productos al restablecer
    }

    // Agregar eventos a los botones
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyFilters);
    }
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
});
