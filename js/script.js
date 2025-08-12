document.addEventListener('DOMContentLoaded', () => {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    let inventoryData = []; // Variable global para almacenar los datos del inventario

    // Función para obtener datos de inventario y productos
    async function fetchInventoryData() {
        try {
            // Hacer ambas peticiones en paralelo
            const [unitsResponse, productsResponse] = await Promise.all([
                fetch('https://healtyapi.bsite.net/api/product_units'),
                fetch('https://healtyapi.bsite.net/api/inventories')
            ]);

            if (!unitsResponse.ok) {
                throw new Error('Error en product_units: ' + unitsResponse.statusText);
            }
            if (!productsResponse.ok) {
                throw new Error('Error en inventories: ' + productsResponse.statusText);
            }

            const unitsData = await unitsResponse.json();
            const productsData = await productsResponse.json();

            console.log("Datos de product_units:", unitsData);
            console.log("Datos de inventories:", productsData);

            if (Array.isArray(unitsData) && Array.isArray(productsData)) {
                // Filtrar solo los que tienen status "activo"
                const activos = unitsData.filter(item => 
                    item.Status && item.Status.toLowerCase() === 'activo'
                );

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

                // Ordenar los productos por id_product
                combinedData.sort((a, b) => {
                    return a.ProductInfo.id_product - b.ProductInfo.id_product;
                });

                inventoryData = combinedData; // Guardar en variable global
                renderTable(combinedData);
            } else {
                console.error("Una o ambas respuestas no son arrays");
            }
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    function createAttributeDiv(label, value) {
        if (!value || value.trim() === '') value = 'No tiene';
        return `<div><strong>${label}:</strong> <span>${value}</span></div>`;
    }

    function renderTable(data) {
        inventoryTableBody.innerHTML = ''; // Limpiar filas existentes

        if (data.length === 0) {
            console.log("No hay datos para mostrar.");
        }

        data.forEach(item => {
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

            // Evento para desplegar/colapsar fila expandible al hacer clic en la fila
            row.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') { // Asegurarse de que no sea la casilla de verificación
                    expandableRow.style.display = expandableRow.style.display === 'none' ? 'table-row' : 'none';
                }
            });
        });
    }

    // Función de búsqueda actualizada
    function searchTable() {
        const input = document.getElementById('busquedaInput'); // Corregido el ID
        if (!input) {
            console.error("Elemento de búsqueda no encontrado");
            return;
        }
        
        const filter = input.value.toUpperCase();
        const filteredData = inventoryData.filter(item => 
            item.id_unit.toString().includes(filter) || 
            item.ProductInfo.name.toUpperCase().includes(filter)
        );
        renderTable(filteredData);
    }

    // Búsqueda de la tabla - corregido el ID del input
    const searchInput = document.getElementById('busquedaInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchTable);
    }

    // Función para limpiar búsqueda
    window.limpiarBusqueda = function() {
        const searchInput = document.getElementById('busquedaInput');
        if (searchInput) {
            searchInput.value = '';
            renderTable(inventoryData);
        }
    }

    // Inicializar la carga de datos
    fetchInventoryData();
});