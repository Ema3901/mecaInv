const inventario = [
  { ID: 261385, CHECK: "NO", STATUS: "DAÑADA", LABEL: "SI", ARTICULO: "Escritorio ejecutivo", OBSERVACIONES: "Pendiente de revisión" },
  { ID: 261386, CHECK: null, STATUS: "BUENA", LABEL: "NO", ARTICULO: "Computadora de escritorio", OBSERVACIONES: "" },
  { ID: 261387, STATUS: "DAÑADA", LABEL: "NO", ARTICULO: "Proyector multimedia", OBSERVACIONES: "" }
];

const tbody = document.querySelector('#pendientesTable tbody');
const alertaCheck = document.getElementById('alertaCheck');

function renderTabla() {
  tbody.innerHTML = '';

  inventario.forEach((item, index) => {
    if (!item.CHECK || item.CHECK !== "SI") {
      const tr = document.createElement('tr');
      tr.setAttribute('data-index', index);

      const selectStatus = `
        <select class="form-select form-select-sm status-select" onchange="actualizarClaseSelect(this)">
          <option value="BUENA" ${item.STATUS === "BUENA" ? "selected" : ""}>BUENA</option>
          <option value="DAÑADA" ${item.STATUS === "DAÑADA" ? "selected" : ""}>DAÑADA</option>
        </select>
      `;

      const selectLabel = `
        <select class="form-select form-select-sm" id="label-${index}">
          <option value="SI" ${item.LABEL === "SI" ? "selected" : ""}>SI</option>
          <option value="NO" ${item.LABEL === "NO" ? "selected" : ""}>NO</option>
        </select>
      `;

      const textareaObs = `
        <textarea class="form-control mt-2" id="obs-${index}" rows="2" placeholder="Observaciones...">${item.OBSERVACIONES || ""}</textarea>
      `;

      tr.innerHTML = `
        <td>${item.ID}</td>
        <td>${item.ARTICULO}</td>
        <td>${selectStatus}</td>
        <td>
          ${item.CHECK ? `<span class="badge-status status-pending">${item.CHECK}</span>` : '<span class="badge-status status-pending">PENDIENTE</span>'}
        </td>
        <td>
          ${selectLabel}
          ${textareaObs}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-success" onclick="aprobarUno(${index})">
            <i class="fas fa-check"></i> Aprobar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    }
  });

  document.querySelectorAll('.status-select').forEach(el => actualizarClaseSelect(el));

  // Fila de mensaje final dentro de la tabla
  const pendientes = inventario.filter(item => !item.CHECK || item.CHECK !== "SI");
  const mensajeExistente = document.getElementById('rowMensajeFinal');
  if (mensajeExistente) mensajeExistente.remove();

  if (pendientes.length === 0) {
    const trMensaje = document.createElement('tr');
    trMensaje.id = "rowMensajeFinal";
    trMensaje.innerHTML = `
      <td colspan="6" class="text-center py-5">
        <i class="fas fa-check-circle mb-3 text-success" style="font-size: 3rem;"></i>
        <h4 class="text-success mt-3 mb-2">Todos los productos han sido revisados,<br>nos vemos la próxima revisión</h4>
        <a href="index.html" class="btn btn-outline-primary mt-3">
          <i class="fas fa-arrow-left"></i> Regresar al inventario
        </a>
      </td>
    `;
    tbody.appendChild(trMensaje);
  }
}

function actualizarClaseSelect(select) {
  select.classList.remove('buena', 'danada');
  if (select.value === 'BUENA') {
    select.classList.add('buena');
  } else if (select.value === 'DAÑADA') {
    select.classList.add('danada');
  }
}

function mostrarAdvertencia() {
  alertaCheck.style.display = 'block';
}

function cancelarAprobacion() {
  alertaCheck.style.display = 'none';
}

function confirmarAprobacion() {
  document.querySelectorAll('#pendientesTable tbody tr').forEach(row => {
    const index = row.getAttribute('data-index');
    const selectStatus = row.querySelector('.status-select');
    const selectLabel = document.getElementById(`label-${index}`);
    const textareaObs = document.getElementById(`obs-${index}`);

    if (index !== null) {
      inventario[index].CHECK = "SI";
      inventario[index].STATUS = selectStatus.value;
      inventario[index].LABEL = selectLabel.value;
      inventario[index].OBSERVACIONES = textareaObs.value;
      inventario[index].NEXT_CHECK = "2025-07-01";
    }
  });

  alertaCheck.style.display = 'none';
  renderTabla();
}

function aprobarUno(index) {
  const row = document.querySelector(`tr[data-index="${index}"]`);
  const selectStatus = row.querySelector('.status-select');
  const selectLabel = document.getElementById(`label-${index}`);
  const textareaObs = document.getElementById(`obs-${index}`);

  inventario[index].CHECK = "SI";
  inventario[index].STATUS = selectStatus.value;
  inventario[index].LABEL = selectLabel.value;
  inventario[index].OBSERVACIONES = textareaObs.value;
  inventario[index].NEXT_CHECK = "2025-07-01";

  renderTabla();
}

renderTabla();
