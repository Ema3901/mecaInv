// Sistema de préstamos de productos - Reemplaza tu función solicitarPrestamo()

// Variable para trackear préstamos activos (opcional, para UI)
let prestamosActivos = [];

// Función principal para solicitar préstamo
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

  // Verificar que el usuario esté logueado
  let currentUser = null;
  
  if (window.sessionManager && window.sessionManager.isLoggedIn()) {
    currentUser = window.sessionManager.getCurrentUser();
  } else {
    // Fallback: intentar obtener directamente del sessionStorage
    const userData = sessionStorage.getItem("usuario");
    if (userData) {
      try {
        currentUser = JSON.parse(userData);
      } catch (error) {
        console.error("Error al parsear usuario:", error);
      }
    }
  }

  if (!currentUser || !currentUser.name) {
    Swal.fire({
      icon: 'error',
      title: 'Error de sesión',
      text: 'No hay una sesión activa. Por favor, inicia sesión.',
      confirmButtonColor: '#dc3545'
    });
    return;
  }

  console.log("Usuario actual:", currentUser);
  
  // Lista de productos seleccionados
  const productosSeleccionados = Array.from(checkboxes).map(cb => {
    const row = cb.closest('tr');
    const id = row.cells[1].textContent.trim(); // ID del producto
    const nombre = row.cells[2].textContent.trim();
    const area = row.cells[5].textContent.trim();
    return { id, nombre, area, checkbox: cb, row };
  });

  let datosAlumno = null;
  let datosConfirmados = false;

  const result = await Swal.fire({
    title: 'Formulario de préstamo',
    html: `
      <div style="text-align: left; font-size: 0.95rem;">
        <label><strong>Profesor:</strong></label><br>
        <div style="color: #6c757d; margin-bottom: 15px;">${currentUser.name}</div>

        <label><strong>Matrícula del alumno:</strong></label>
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <input id="swalMatricula" class="swal2-input" maxlength="12" placeholder="Ej. 2316109081" type="text" style="flex: 1;">
          <button type="button" id="buscarAlumnoBtn" class="btn btn-primary" style="margin-left: 8px; height: 40px;" disabled>
            <i class="fas fa-search"></i>
          </button>
        </div>

        <div id="loadingAlumno" style="display: none; text-align: center; margin: 10px 0;">
          <i class="fas fa-spinner fa-spin"></i> Buscando alumno...
        </div>

        <div id="datosAlumnoContainer" style="display: none; margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
          <div><strong>Datos del alumno:</strong></div>
          <div id="datosAlumnoContent"></div>
        </div>

        <div id="articulosContainer" style="display: none; margin-top: 15px;">
          <div><strong>Artículos a prestar:</strong></div>
          ${productosSeleccionados.map(p => `
            <div style="color: #495057; margin: 5px 0;">• ${p.nombre} <span style="color:#888;">(${p.area})</span></div>
          `).join('')}
        </div>
      </div>
    `,
    didOpen: () => {
      const input = Swal.getPopup().querySelector('#swalMatricula');
      const btn = Swal.getPopup().querySelector('#buscarAlumnoBtn');
      const loading = Swal.getPopup().querySelector('#loadingAlumno');
      const datosContainer = Swal.getPopup().querySelector('#datosAlumnoContainer');
      const datosContent = Swal.getPopup().querySelector('#datosAlumnoContent');
      const articulosContainer = Swal.getPopup().querySelector('#articulosContainer');

      input.addEventListener('input', () => {
        const val = input.value.trim();
        btn.disabled = !(val.length >= 8 && val.length <= 12 && /^\d+$/.test(val));
        
        // Ocultar datos si cambia la matrícula
        if (datosConfirmados) {
          datosContainer.style.display = 'none';
          articulosContainer.style.display = 'none';
          datosConfirmados = false;
          datosAlumno = null;
        }
      });

      btn.addEventListener('click', async () => {
        const matricula = input.value.trim();
        
        try {
          loading.style.display = 'block';
          btn.disabled = true;
          
          console.log(`Buscando alumno con matrícula: ${matricula}`);
          
          // Buscar alumno por matrícula
          const url = `https://healtyapi.bsite.net/api/students/search?term=${matricula}`;
          console.log(`URL de búsqueda: ${url}`);
          
          const response = await fetch(url);
          
          console.log(`Response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error HTTP ${response.status}:`, errorText);
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
          }
          
          const estudiantes = await response.json();
          console.log('Estudiantes encontrados:', estudiantes);
          
          loading.style.display = 'none';
          
          if (!estudiantes || estudiantes.length === 0) {
            console.warn('No se encontraron estudiantes');
            
            // En lugar de usar showValidationMessage, mostrar un alert temporal
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'color: #dc3545; margin-top: 10px; font-size: 0.9rem; text-align: center;';
            errorDiv.textContent = '❌ No se encontró ningún alumno con esa matrícula';
            
            // Remover mensaje anterior si existe
            const existingError = Swal.getPopup().querySelector('.error-message');
            if (existingError) existingError.remove();
            
            errorDiv.className = 'error-message';
            loading.parentNode.insertBefore(errorDiv, loading.nextSibling);
            
            btn.disabled = false;
            return;
          }

          // Remover mensaje de error si existe
          const existingError = Swal.getPopup().querySelector('.error-message');
          if (existingError) existingError.remove();

          const estudiante = estudiantes[0];
          datosAlumno = estudiante;
          
          console.log('Datos del estudiante:', estudiante);
          
          // Mostrar datos del alumno
          datosContent.innerHTML = `
            <div style="color: #495057; margin: 5px 0;">✅ <strong>Nombre:</strong> ${estudiante.student_name}</div>
            <div style="color: #495057; margin: 5px 0;">🎓 <strong>Grado:</strong> ${estudiante.Grade}${estudiante.Group}</div>
            <div style="color: #495057; margin: 5px 0;">📚 <strong>Carrera:</strong> ${estudiante.carrer}</div>
            <div style="color: #495057; margin: 5px 0;">📋 <strong>Préstamos activos:</strong> ${estudiante.ActiveBorrows || 0}</div>
          `;
          
          datosContainer.style.display = 'block';
          articulosContainer.style.display = 'block';
          datosConfirmados = true;
          btn.disabled = false;
          
          // Cambiar icono del botón a check
          btn.innerHTML = '<i class="fas fa-check"></i>';
          btn.style.backgroundColor = '#28a745';
          
        } catch (error) {
          loading.style.display = 'none';
          btn.disabled = false;
          console.error('Error completo al buscar alumno:', error);
          
          // Mostrar error de manera más visible
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = 'color: #dc3545; margin-top: 10px; font-size: 0.9rem; text-align: center; padding: 10px; background-color: #f8d7da; border-radius: 5px;';
          errorDiv.textContent = `❌ Error: ${error.message}`;
          
          // Remover mensaje anterior si existe
          const existingError = Swal.getPopup().querySelector('.error-message');
          if (existingError) existingError.remove();
          
          errorDiv.className = 'error-message';
          loading.parentNode.insertBefore(errorDiv, loading.nextSibling);
        }
      });
      
      // Focus en el input
      input.focus();
    },
    showCancelButton: true,
    confirmButtonText: 'Confirmar préstamo',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2fa46e',
    preConfirm: () => {
      const matricula = Swal.getPopup().querySelector('#swalMatricula').value.trim();
      
      if (!matricula || !/^\d+$/.test(matricula) || matricula.length < 8 || matricula.length > 12) {
        // En lugar de showValidationMessage, usar un enfoque más directo
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: #dc3545; margin-top: 10px; font-size: 0.9rem; text-align: center;';
        errorDiv.textContent = '❌ Ingresa una matrícula válida (8-12 dígitos)';
        errorDiv.className = 'validation-error';
        
        const existingError = Swal.getPopup().querySelector('.validation-error');
        if (existingError) existingError.remove();
        
        const popup = Swal.getPopup().querySelector('.swal2-html-container');
        popup.appendChild(errorDiv);
        
        return false;
      }
      
      if (!datosConfirmados || !datosAlumno) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: #dc3545; margin-top: 10px; font-size: 0.9rem; text-align: center;';
        errorDiv.textContent = '❌ Debes buscar y confirmar los datos del alumno antes de continuar';
        errorDiv.className = 'validation-error';
        
        const existingError = Swal.getPopup().querySelector('.validation-error');
        if (existingError) existingError.remove();
        
        const popup = Swal.getPopup().querySelector('.swal2-html-container');
        popup.appendChild(errorDiv);
        
        return false;
      }
      
      return { matricula, datosAlumno };
    }
  });

  if (!result.isConfirmed || !result.value) {
    return;
  }

  // Procesar el préstamo
  await procesarPrestamo(result.value.datosAlumno, currentUser, productosSeleccionados);
}

// Función para procesar múltiples préstamos
async function procesarPrestamo(estudiante, profesor, productos) {
  const loadingSwal = Swal.fire({
    title: 'Procesando préstamo...',
    html: 'Registrando productos...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const fechaActual = new Date().toISOString();
    const prestamosExitosos = [];
    const prestamosErrores = [];

    // Procesar cada producto individualmente
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      
      // Actualizar el mensaje de carga
      Swal.getHtmlContainer().innerHTML = `Registrando producto ${i + 1} de ${productos.length}...<br><small>${producto.nombre}</small>`;

      try {
        const prestamoData = {
          fk_unit: parseInt(producto.id),
          fk_user: profesor.id_user,
          fk_student: estudiante.id_student,
          borrow_date: fechaActual,
          return_date: null,
          status: "prestado"
        };

        console.log('Enviando préstamo:', prestamoData);

        const response = await fetch('https://healtyapi.bsite.net/api/borroweds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prestamoData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }

        const resultado = await response.json();
        console.log('Préstamo creado:', resultado);

        // Marcar como exitoso
        prestamosExitosos.push({
          producto: producto,
          resultado: resultado
        });

        // Actualizar UI inmediatamente
        actualizarUIProducto(producto, true);

      } catch (error) {
        console.error(`Error al prestar ${producto.nombre}:`, error);
        prestamosErrores.push({
          producto: producto,
          error: error.message
        });
      }
    }

    Swal.close();

    // Mostrar resultado
    if (prestamosExitosos.length > 0 && prestamosErrores.length === 0) {
      // Todos exitosos
      Swal.fire({
        icon: 'success',
        title: '¡Préstamos registrados!',
        html: `
          <strong>${prestamosExitosos.length} producto(s) prestado(s) exitosamente</strong><br><br>
          <div style="text-align: left;">
            <strong>Profesor:</strong> ${profesor.name}<br>
            <strong>Alumno:</strong> ${estudiante.student_name}<br>
            <strong>Matrícula:</strong> ${estudiante.student_registration}<br>
            <strong>Grado:</strong> ${estudiante.Grade}${estudiante.Group} - ${estudiante.carrer}
          </div>
        `,
        confirmButtonColor: '#2fa46e'
      });
    } else if (prestamosExitosos.length > 0 && prestamosErrores.length > 0) {
      // Algunos exitosos, algunos con error
      Swal.fire({
        icon: 'warning',
        title: 'Préstamos parcialmente registrados',
        html: `
          <strong>Exitosos:</strong> ${prestamosExitosos.length}<br>
          <strong>Con errores:</strong> ${prestamosErrores.length}<br><br>
          <div style="text-align: left; font-size: 0.9rem;">
            ${prestamosErrores.map(p => `<div>❌ ${p.producto.nombre}: ${p.error}</div>`).join('')}
          </div>
        `,
        confirmButtonColor: '#ffc107'
      });
    } else {
      // Todos con error
      Swal.fire({
        icon: 'error',
        title: 'Error en los préstamos',
        html: `
          No se pudo registrar ningún préstamo:<br><br>
          <div style="text-align: left; font-size: 0.9rem;">
            ${prestamosErrores.map(p => `<div>❌ ${p.producto.nombre}: ${p.error}</div>`).join('')}
          </div>
        `,
        confirmButtonColor: '#dc3545'
      });
    }

  } catch (error) {
    Swal.close();
    console.error('Error general en procesarPrestamo:', error);
    
    Swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: 'Ocurrió un error al procesar los préstamos. Intenta nuevamente.',
      confirmButtonColor: '#dc3545'
    });
  }
}

// Función para actualizar la UI del producto
function actualizarUIProducto(producto, prestado = true) {
  const row = producto.row;
  const checkbox = producto.checkbox;
  const articuloCell = row.cells[2];

  if (prestado) {
    // Marcar como ocupado
    row.classList.add('ocupado-row');
    articuloCell.innerHTML = `${producto.nombre} <span class="ocupado-label">(OCUPADO)</span>`;
    checkbox.disabled = true;
    checkbox.checked = false;
    
    // Agregar a tracking local (opcional)
    prestamosActivos.push({
      id: producto.id,
      nombre: producto.nombre,
      fecha: new Date().toISOString()
    });
  } else {
    // Marcar como disponible (para cuando se devuelva)
    row.classList.remove('ocupado-row');
    articuloCell.innerHTML = producto.nombre;
    checkbox.disabled = false;
    
    // Remover del tracking local
    prestamosActivos = prestamosActivos.filter(p => p.id !== producto.id);
  }
}

// Función para verificar el estado actual de préstamos (opcional)
async function verificarEstadoPrestamos() {
  try {
    const response = await fetch('https://healtyapi.bsite.net/api/borroweds');
    if (response.ok) {
      const prestamos = await response.json();
      
      // Filtrar préstamos activos (sin return_date)
      const prestamosActivos = prestamos.filter(p => !p.return_date);
      
      // Actualizar UI según préstamos activos
      prestamosActivos.forEach(prestamo => {
        const unitId = prestamo.UnitInfo?.id_unit;
        if (unitId) {
          // Buscar el producto en la tabla y marcarlo como ocupado
          const rows = document.querySelectorAll('#inventoryTableBody tr');
          rows.forEach(row => {
            const idCell = row.cells[1];
            if (idCell && idCell.textContent.trim() === unitId.toString()) {
              const checkbox = row.querySelector('input[type="checkbox"]');
              const nameCell = row.cells[2];
              
              if (checkbox && nameCell) {
                row.classList.add('ocupado-row');
                nameCell.innerHTML = `${nameCell.textContent.replace(' (OCUPADO)', '')} <span class="ocupado-label">(OCUPADO)</span>`;
                checkbox.disabled = true;
                checkbox.checked = false;
              }
            }
          });
        }
      });
      
      console.log(`${prestamosActivos.length} préstamos activos verificados`);
    }
  } catch (error) {
    console.error('Error al verificar estado de préstamos:', error);
  }
}

// Función para resetear filtros (mantener tu función original)
function resetFilters() {
  document.getElementById('filterForm').reset();
}

// Auto-verificar préstamos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para que se cargue la tabla
  setTimeout(verificarEstadoPrestamos, 1000);
});

console.log('Sistema de préstamos cargado correctamente');