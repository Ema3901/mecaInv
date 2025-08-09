document.addEventListener('DOMContentLoaded', () => {
  const eliminados = [
    {
      CHECK: "NO",
      STATUS: "DAÑADA",
      LABEL: "SI",
      ID: 261300,
      ARTICULO: "Impresora dañada",
      MODELO: "HP 1015",
      OBSERVACIONES: "Ya no imprime correctamente",
      AREA: "Oficina",
      RESGUARDANTE: "LIC. SANDRA TORRES",
      EDIFICIO: "A",
      TIPO: "Cont",
      MARCA: "HP"
    },
    {
      CHECK: "SI",
      STATUS: "BUENA",
      LABEL: "NO",
      ID: 261301,
      ARTICULO: "Proyector antiguo",
      MODELO: "Epson 3200",
      OBSERVACIONES: "Funcionando pero desactualizado",
      AREA: "Aula 3",
      RESGUARDANTE: "ING. LUIS RIVERA",
      EDIFICIO: "B",
      TIPO: "Cons",
      MARCA: "Epson"
    }
  ];

  const tableBody = document.getElementById('inventoryTableBody');

  const normalizeText = (text) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function createAttributeDiv(label, value) {
    if (!value || value.trim() === '') value = 'No tiene';
    return `<div><strong>${label}:</strong> <span>${value}</span></div>`;
  }

  function renderTable(data) {
    tableBody.innerHTML = '';

    data.forEach(item => {
      const row = document.createElement('tr');
      row.classList.add('item-row');
      row.setAttribute('data-id', item.ID);

      const statusClass = item.STATUS.toLowerCase() === 'buena' ? 'status-good' : 'status-bad';
      const checkClass = item.CHECK.toLowerCase() === 'si' ? 'status-good' : 'status-pending';

      row.innerHTML = `
        <td><input type="checkbox" class="checkbox-select" /></td>
        <td class="col-id">${item.ID}</td>
        <td class="col-articulo">${item.ARTICULO}</td>
        <td>${item.MODELO}</td>
        <td>${item.EDIFICIO}</td>
        <td>${item.AREA}</td>
        <td><span class="badge-status ${statusClass}">${item.STATUS}</span></td>
        <td><span class="badge-status ${checkClass}">${item.CHECK}</span></td>
      `;

      tableBody.appendChild(row);

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
      tableBody.appendChild(expandableRow);

      row.addEventListener('click', (e) => {
        if (e.target.type !== 'checkbox') {
          expandableRow.style.display = expandableRow.style.display === 'none' ? 'table-row' : 'none';
        }
      });
    });
  }

  function searchTable() {
    const input = document.getElementById("busquedaInput");
    const filtro = normalizeText(input.value.trim());

    document.querySelectorAll('#inventoryTableBody tr').forEach((row, index, rows) => {
      if (row.classList.contains('expandable-row')) return;

      const id = normalizeText(row.querySelector('.col-id')?.textContent || "");
      const articulo = normalizeText(row.querySelector('.col-articulo')?.textContent || "");
      const visible = id.includes(filtro) || articulo.includes(filtro);

      row.style.display = visible ? '' : 'none';

      const nextRow = rows[index + 1];
      if (nextRow && nextRow.classList.contains('expandable-row')) {
        nextRow.style.display = visible ? nextRow.style.display : 'none';
      }
    });
  }

  function limpiarBusqueda() {
    const input = document.getElementById('busquedaInput');
    input.value = "";
    input.dispatchEvent(new Event('input'));
  }

  function applyFilters() {
    const etiquetado = document.getElementById('filterEtiquetado').value;
    const status = document.getElementById('filterStatus').value;
    const tipo = document.getElementById('filterTipo').value;
    const edificio = document.getElementById('filterEdificio').value;
    const area = document.getElementById('filterArea').value;

    const filtered = eliminados.filter(item => {
      return (
        (etiquetado === 'Etiquetado' || item.LABEL.toLowerCase() === etiquetado.toLowerCase()) &&
        (status === 'Status' || item.STATUS.toLowerCase() === (status === 'bueno' ? 'buena' : 'dañada')) &&
        (tipo === 'Tipo' || item.TIPO.toLowerCase() === tipo.toLowerCase()) &&
        (edificio === 'Edificio' || item.EDIFICIO.toLowerCase() === edificio.toLowerCase()) &&
        (area === 'Área' || normalizeText(item.AREA) === normalizeText(area))
      );
    });

    renderTable(filtered);

    const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    modal.hide();
  }

  function eliminarSeleccionados() {
    const checkboxes = document.querySelectorAll('#inventoryTableBody input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
      alert("Selecciona al menos un producto para eliminar.");
      return;
    }

    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const id = parseInt(row.getAttribute('data-id'));
      const index = eliminados.findIndex(item => item.ID === id);

      if (index !== -1) {
        eliminados.splice(index, 1);
      }
    });

    renderTable(eliminados);
  }

  // EVENTOS
  document.getElementById('busquedaInput').addEventListener('input', searchTable);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('filterForm').addEventListener('reset', () => renderTable(eliminados));
  document.querySelector('button.btn.btn-secondary').addEventListener('click', eliminarSeleccionados);

  // INICIAL
  renderTable(eliminados);
});
