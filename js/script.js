

document.addEventListener('DOMContentLoaded', () => {
    const inventoryData = [
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "NO",
            ID: 261384,
            ARTICULO: "Silla plegable",
            MARCA: "Office Depot",
            MODELO: "CS-1128-B",
            OBSERVACIONES: "Negro, tela/metal, 75cm x 48.5cm x 46cm, respaldo medio / mecanismo tubular de acero / soporte trasero de carga / reposa pies",
            AREA: "Dirección",
            RESGUARDANTE: "ING. DIEGO CRUZ ORTEGA",
            EDIFICIO: "A",
            TIPO: "Cons"
        },
        {
            CHECK: "NO",
            STATUS: "DAÑADA",
            LABEL: "SI",
            ID: 261385,
            ARTICULO: "Escritorio ejecutivo",
            MARCA: "Ofitech",
            MODELO: "EX-450",
            OBSERVACIONES: "Madera maciza, color nogal, con cajones laterales y superficie de vidrio",
            AREA: "Oficina Principal",
            RESGUARDANTE: "LIC. MARÍA PÉREZ",
            EDIFICIO: "B",
            TIPO: "Cont"
        },
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "NO",
            ID: 261386,
            ARTICULO: "Computadora de escritorio",
            MARCA: "Dell",
            MODELO: "OptiPlex 7080",
            OBSERVACIONES: "Procesador i7, 16GB RAM, 512GB SSD, monitor 24 pulgadas",
            AREA: "Departamento IT",
            RESGUARDANTE: "ING. JUAN GARCÍA",
            EDIFICIO: "C",
            TIPO: "Cont"
        },
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "NO",
            ID: 261387,
            ARTICULO: "Proyector multimedia",
            MARCA: "Epson",
            MODELO: "EB-X41",
            OBSERVACIONES: "Resolución XGA, brillo 3600 lúmenes, conectividad HDMI y VGA",
            AREA: "Sala de juntas",
            RESGUARDANTE: "LIC. ANA LÓPEZ",
            EDIFICIO: "A",
            TIPO: "Cons"
        },
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "SI",
            ID: 261388,
            ARTICULO: "Silla ergonómica",
            MARCA: "Herman Miller",
            MODELO: "Aeron",
            OBSERVACIONES: "Con soporte lumbar, ajuste de altura y reposabrazos",
            AREA: "Departamento Diseño",
            RESGUARDANTE: "ING. CARLOS MENDOZA",
            EDIFICIO: "B",
            TIPO: "Cont"
        },
        {
            CHECK: "NO",
            STATUS: "DAÑADA",
            LABEL: "SI",
            ID: 261389,
            ARTICULO: "Impresora láser",
            MARCA: "HP",
            MODELO: "LaserJet Pro M404n",
            OBSERVACIONES: "Impresión monocromática, conexión por USB y red",
            AREA: "Área de impresión",
            RESGUARDANTE: "LIC. MARÍA HERNÁNDEZ",
            EDIFICIO: "C",
            TIPO: "Cons"
        },
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "NO",
            ID: 261390,
            ARTICULO: "Mesa de reuniones",
            MARCA: "Ikea",
            MODELO: "BEKANT",
            OBSERVACIONES: "No tiene",
            AREA: "Sala de juntas",
            RESGUARDANTE: "ING. MIGUEL SÁNCHEZ",
            EDIFICIO: "A",
            TIPO: "Cont"
        },
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "NO",
            ID: 261391,
            ARTICULO: "Lámpara de escritorio",
            MARCA: "Philips",
            MODELO: "Hue White",
            OBSERVACIONES: "Con control remoto y brillo ajustable",
            AREA: "Departamento IT",
            RESGUARDANTE: "ING. JUAN GARCÍA",
            EDIFICIO: "C",
            TIPO: "Cons"
        },
        {
            CHECK: "NO",
            STATUS: "DAÑADA",
            LABEL: "SI",
            ID: 261392,
            ARTICULO: "Cafetera eléctrica",
            MARCA: "Nespresso",
            MODELO: "Essenza Mini",
            OBSERVACIONES: "Capacidad para 1-2 tazas, color negro",
            AREA: "Cafetería",
            RESGUARDANTE: "LIC. ANA LÓPEZ",
            EDIFICIO: "B",
            TIPO: "Cons"
        },
        {
            CHECK: "SI",
            STATUS: "BUENA",
            LABEL: "NO",
            ID: 261393,
            ARTICULO: "Router inalámbrico",
            MARCA: "TP-Link",
            MODELO: "Archer C7",
            OBSERVACIONES: "Dual band, 3 antenas externas",
            AREA: "Departamento IT",
            RESGUARDANTE: "ING. JUAN GARCÍA",
            EDIFICIO: "C",
            TIPO: "Cont"
        }
    ];

    const inventoryTableBody = document.getElementById('inventoryTableBody');

    function createAttributeDiv(label, value) {
        if (!value || value.trim() === '') value = 'No tiene';
        return `<div><strong>${label}:</strong> <span>${value}</span></div>`;
    }

    function renderTable(data) {
        inventoryTableBody.innerHTML = ''; // Limpiar filas existentes

        data.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('item-row');
            row.setAttribute('data-id', item.ID);

            const statusLower = item.STATUS.toLowerCase();
            const statusClass = statusLower === 'buena' ? 'status-good' : (statusLower === 'dañado' || statusLower === 'dañada' ? 'status-bad' : 'status-pending');
            const checkLower = item.CHECK.toLowerCase();
            const checkClass = checkLower === 'si' || checkLower === 'completed' ? 'status-good' : 'status-pending';

            row.innerHTML = `
                <td><input type="checkbox" class="checkbox-select"></td>
                <td class="col-id">${item.ID}</td>
                <td class="col-articulo">${item.ARTICULO}</td>
                <td>${item.MODELO}</td>
                <td>${item.EDIFICIO}</td>
                <td>${item.AREA}</td>
                <td><span class="badge-status ${statusClass}">${item.STATUS}</span></td>
                <td><span class="badge-status ${checkClass}">${item.CHECK}</span></td>
            `;

            inventoryTableBody.appendChild(row);

            const expandableRow = document.createElement('tr');
            expandableRow.classList.add('expandable-row');
            expandableRow.style.display = 'none';
            expandableRow.innerHTML = `
                <td colspan="8">
                    <div class="expandable-content">
                      <div class="expandable-attributes">
                        ${createAttributeDiv('Etiquetado', item.LABEL)}
                        ${createAttributeDiv('Tipo', item.TIPO)}
                        ${createAttributeDiv('Marca', item.MARCA)}
                        ${createAttributeDiv('Resguardante', item.RESGUARDANTE)}
                      </div>
                      <div class="expandable-observations">
                        ${createAttributeDiv('Observaciones', item.OBSERVACIONES)}
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

    function searchTable() {
        let input = document.getElementById('busquedaInput');
        let filter = input.value.toUpperCase();
        let filteredData = inventoryData.filter(item => item.ID.toString().includes(filter));
        renderTable(filteredData);
    }

    function sortTable(columnIndex) {
        const sortedData = [...inventoryData];
        sortedData.sort((a, b) => {
            const valA = a[Object.keys(a)[columnIndex]];
            const valB = b[Object.keys(b)[columnIndex]];

            if (typeof valA === 'string') {
                return valA.localeCompare(valB);
            } else {
                return valA - valB;
            }
        });

        renderTable(sortedData);
    }

    document.getElementById('applyFilters').addEventListener('click', () => {
    const etiquetado = document.getElementById('filterEtiquetado').value;
    const status = document.getElementById('filterStatus').value;
    const tipo = document.getElementById('filterTipo').value;
    const edificio = document.getElementById('filterEdificio').value;
    const area = document.getElementById('filterArea').value;

    const filteredData = inventoryData.filter(item => {
        return (
            (etiquetado === 'Etiquetado' || item.LABEL.toLowerCase() === etiquetado.toLowerCase()) &&
            (status === 'Status' || item.STATUS.toLowerCase() === (status === 'bueno' ? 'buena' : 'dañada')) &&
            (tipo === 'Tipo' || item.TIPO.toLowerCase() === tipo.toLowerCase()) &&
            (edificio === 'Edificio' || item.EDIFICIO.toLowerCase() === edificio.toLowerCase()) &&
            (area === 'Área' || normalizeText(item.AREA) === normalizeText(area))
        );
    });

    renderTable(filteredData);

    const filterModal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    filterModal.hide();
});

document.querySelector('[onclick="resetFilters()"]').addEventListener('click', () => {
  document.getElementById('filterForm').reset();
  renderTable(inventoryData); // Recarga la tabla con todo
});



    // Inicializar la tabla con los datos
    renderTable(inventoryData);

    // Agregar evento de búsqueda
    document.getElementById('searchInput').addEventListener('keyup', searchTable);
});
