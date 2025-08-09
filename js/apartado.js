const ocupados = [];

function resetFilters() {
  document.getElementById('filterForm').reset();
}

async function solicitarPrestamo() {
  const checkboxes = document.querySelectorAll('#inventoryTableBody input[type="checkbox"]:not(:disabled):checked');
  if (checkboxes.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Ningún producto seleccionado',
      text: 'Debes seleccionar al menos un producto para prestar.',
      confirmButtonColor: '#2fa46e'
    });
    return;
  }

  // Lista de artículos y áreas seleccionadas
  const productosSeleccionados = Array.from(checkboxes).map(cb => {
    const row = cb.closest('tr');
    const nombre = row.cells[2].textContent.trim();
    const area = row.cells[5].textContent.trim();
    return { nombre, area };
  });

  let datosConfirmados = false;

  await Swal.fire({
    title: 'Formulario de préstamo',
    html: `
      <div style="text-align: left; font-size: 0.95rem;">
        <label><strong>Profesor:</strong></label><br>
        <div style="color: #6c757d; margin-bottom: 10px;">Ann Lee</div>

        <label><strong>Matrícula del alumno:</strong></label>
        <div style="display: flex; align-items: center;">
          <input id="swalMatricula" class="swal2-input" maxlength="10" placeholder="Ej. 202145678" type="text" style="flex: 1;">
          <button type="button" id="buscarAlumnoBtn" class="btn btn-success" style="margin-left: 8px; height: 40px;" disabled>
            <i class="fas fa-check"></i>
          </button>
        </div>

        <div id="datosAlumnoContainer" style="display: none; margin-top: 15px;">
          <div><strong>Datos del alumno:</strong></div>
          <div style="color: #495057;">Nombre: paquito</div>
          <div style="color: #495057;">Grado: 5C</div>
          <div style="color: #495057;">Carrera: Mecatrónica</div>
        </div>

        <div id="articulosContainer" style="display: none; margin-top: 15px;">
          <div><strong>Artículos a prestar:</strong></div>
          ${productosSeleccionados.map(p => `
            <div style="color: #495057;">- ${p.nombre} <span style="color:#888;">(${p.area})</span></div>
          `).join('')}
        </div>
      </div>
    `,
    didOpen: () => {
      const input = Swal.getPopup().querySelector('#swalMatricula');
      const btn = Swal.getPopup().querySelector('#buscarAlumnoBtn');
      const datos = Swal.getPopup().querySelector('#datosAlumnoContainer');
      const articulos = Swal.getPopup().querySelector('#articulosContainer');

      input.addEventListener('input', () => {
        const val = input.value.trim();
        btn.disabled = !(val.length > 0 && val.length <= 10 && /^\d+$/.test(val));
      });

      btn.addEventListener('click', () => {
        datos.style.display = 'block';
        articulos.style.display = 'block';
        datosConfirmados = true;
      });
    },
    showCancelButton: true,
    confirmButtonText: 'Confirmar préstamo',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const matricula = Swal.getPopup().querySelector('#swalMatricula').value.trim();
      if (!matricula || !/^\d+$/.test(matricula) || matricula.length > 10) {
        Swal.showValidationMessage('Ingresa una matrícula válida (máximo 10 dígitos)');
        return false;
      }
      if (!datosConfirmados) {
        Swal.showValidationMessage('Debes confirmar la matrícula antes de continuar');
        return false;
      }
      return matricula;
    }
  }).then(result => {
    if (!result.isConfirmed || !result.value) return;

    const matricula = result.value;
    const profesor = "Ann Lee";
    const fechaHoy = new Date().toISOString().split('T')[0];

    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const id = row.cells[1].textContent;
      const articulo = row.cells[2];

      ocupados.push({
        ID: id,
        ARTICULO: articulo.textContent,
        PROFESOR: profesor,
        MATRICULA: matricula,
        FECHA: fechaHoy
      });

      row.classList.add('ocupado-row');
      articulo.innerHTML = `${articulo.textContent} <span class="ocupado-label">(OCUPADO)</span>`;
      checkbox.disabled = true;
      checkbox.checked = false;
    });

    Swal.fire({
      icon: 'success',
      title: '¡Préstamo registrado!',
      html: `Producto(s) prestado(s) a <b>${profesor}</b><br>Matrícula: <b>${matricula}</b><br>Alumno: <b>paquito</b> (5C - Mecatrónica)`,
      confirmButtonColor: '#2fa46e'
    });

    console.log("Productos prestados:", ocupados);
  });
}
