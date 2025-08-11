document.addEventListener('DOMContentLoaded', () => {
    const inventoryTableBody = document.getElementById('inventoryTableBody');

    // Hacer una solicitud GET a la API
    fetch('https://healtyapi.bsite.net/api/product_units')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();  // Convertir la respuesta en formato JSON
        })
        .then(data => {
            console.log("Datos obtenidos de la API:", data);  // Depuración: mostrar los datos
            if (Array.isArray(data)) {
                // Filtrar solo los que tienen status "activo"
                const activos = data.filter(item => 
                    item.Status && item.Status.toLowerCase() === 'activo'
                );

                // Ordenar los productos por id_product
                activos.sort((a, b) => {
                    return a.ProductInfo.id_product - b.ProductInfo.id_product;
                });

                renderTable(activos);  // Pasar los datos filtrados a la función que renderiza la tabla
            } else {
                console.error("La respuesta no es un array", data);
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos:", error);  // Depuración: manejar el error
        });

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

            // Fila expandible con más detalles
            const expandableRow = document.createElement('tr');
            expandableRow.classList.add('expandable-row');
            expandableRow.style.display = 'none';
            expandableRow.innerHTML = `
                <td colspan="8">
                    <div class="expandable-content">
                      <div class="expandable-attributes">
                        ${createAttributeDiv('Etiquetado', item.LabelStatus)}
                        ${createAttributeDiv('Tipo', item.ProductInfo.Category)}
                        ${createAttributeDiv('Resguardante', item.GuardianInfo.name)}
                        ${createAttributeDiv('Email', item.GuardianInfo.email)}
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

    // Búsqueda de la tabla
    document.getElementById('searchInput').addEventListener('keyup', searchTable);

    function searchTable() {
        let input = document.getElementById('searchInput');
        let filter = input.value.toUpperCase();
        let filteredData = inventoryData.filter(item => item.ID.toString().includes(filter));
        renderTable(filteredData);
    }
});
