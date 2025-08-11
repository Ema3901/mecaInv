// Endpoints base
const API_BASE = `https://healtyapi.bsite.net/api`;
const selectors = {
  categoria: { url: `${API_BASE}/categories`, id: 'id_category', name: 'category_name'},
  marca: { url: `${API_BASE}/brands`, id: 'id_brand', name: 'brand_name' },
  area: { url: `${API_BASE}/areas`, id: 'id_area', name: 'area_name' },
  ubicacion: { url: `${API_BASE}/location_`, id: 'id_location', name: 'location_name' },
  laboratorio: { url: `${API_BASE}/laboratories`, id: 'id_lab', name: 'lab_name' },
  pendiente: { url: `${API_BASE}/pendings`, id: 'id_pending', name: 'status_p' },
  condicion: { url: `${API_BASE}/status_l`, id: 'id_status_label', name: 'status_label' },
  estado: { url: `${API_BASE}/disabled_`, id: 'id_disable', name: 'status_d' },
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status} al pedir ${url}`);
  return res.json();
}

async function fillSelect(selectEl, endpointInfo, placeholder = '--Selecciona--') { 
  try { 
    const data = await fetchJSON(endpointInfo.url); 
    selectEl.innerHTML = `<option value="">${placeholder}</option>`; 
    if (Array.isArray(data)) { 
      data.forEach(item => { 
        const id = item[endpointInfo.id]; 
        const name = item[endpointInfo.name]; 
        if (id === undefined || name === undefined) return; 
        const opt = document.createElement('option'); 
        opt.value = id;
        opt.textContent = name; 
        selectEl.appendChild(opt); 
      }); 
    } 
  } catch (e) { 
    selectEl.innerHTML = `<option value="">Error cargando</option>`; 
    showMessage(`No se pudieron cargar datos de ${endpointInfo.url}: ${e.message}`, 'error'); 
  }
}

async function fillGuardians(selectEl) {
  try {
    const data = await fetchJSON(`${API_BASE}/users`);
    selectEl.innerHTML = `<option value="">--Selecciona--</option>`;
    if (Array.isArray(data)) {
      data.forEach(u => {
        const rol = u?.RoleInfo?.rol || '';
        if (rol.toLowerCase() === 'alumno') return; // excluir alumnos
        const id = u.id_user;
        const name = u.name;
        if (id === undefined || name === undefined) return;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        selectEl.appendChild(opt);
      });
    }
  } catch (e) {
    selectEl.innerHTML = `<option value="">Error cargando guardianes</option>`;
    showMessage(`Error cargando guardianes: ${e.message}`, 'error');
  }
}

function showMessage(msg, type = 'info') {
  const messagesContainer = document.getElementById('messages');
  const div = document.createElement('div');
  
  // Limpiar mensajes anteriores después de un tiempo
  setTimeout(() => {
    if (div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }, 5000);
  
  div.textContent = msg;
  
  // Aplicar clases de Bootstrap para los mensajes
  if (type === 'error') {
    div.className = 'alert alert-danger alert-dismissible fade show';
    div.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  } else if (type === 'success') {
    div.className = 'alert alert-success alert-dismissible fade show';
    div.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  } else {
    div.className = 'alert alert-info alert-dismissible fade show';
    div.innerHTML = `
      <i class="fas fa-info-circle me-2"></i>${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  }
  
  messagesContainer.appendChild(div);
}

// Inicializar selects del paso 1
document.addEventListener('DOMContentLoaded', async () => {
  await fillSelect(document.getElementById('categoria'), selectors.categoria);
  await fillSelect(document.getElementById('marca'), selectors.marca);
  await fillSelect(document.getElementById('pendiente'), selectors.pendiente);
  await fillSelect(document.getElementById('condicion'), selectors.condicion);
  await fillSelect(document.getElementById('estado'), selectors.estado);
});

// Ir a paso 2
document.getElementById('toStep2').addEventListener('click', async (e) => {
  e.preventDefault();
  
  // Limpiar mensajes anteriores
  document.getElementById('messages').innerHTML = '';
  
  // validar básicos
  const nombre = document.getElementById('nombre').value.trim();
  const modelo = document.getElementById('modelo').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const categoria = document.getElementById('categoria').value;
  const marca = document.getElementById('marca').value;
  const especificaciones = document.getElementById('especificaciones').value.trim();
  const unidades = parseInt(document.getElementById('unidades').value, 10);
  const pendiente = document.getElementById('pendiente').value;
  const condicion = document.getElementById('condicion').value;
  const estado = document.getElementById('estado').value;

  if (!nombre || !modelo || !descripcion || !categoria || !marca || !especificaciones || isNaN(unidades) || unidades < 1 || !pendiente || !condicion || !estado) {
    showMessage('Todos los campos del producto son obligatorios y unidades al menos 1.', 'error');
    return;
  }

  // Mostrar loading
  const btn = document.getElementById('toStep2');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
  btn.disabled = true;

  try {
    // Construir formularios de unidades dinámicamente
    const container = document.getElementById('unitsContainer');
    container.innerHTML = '';
    
    for (let i = 1; i <= unidades; i++) {
      const div = document.createElement('div');
      div.className = 'unit-block card mb-4';
      div.innerHTML = `
        <div class="card-header">
          <h5 class="mb-0"><i class="fas fa-cube me-2"></i>Unidad ${i}</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label class="form-label">Serial <span class="required">*</span></label>
                <input type="text" class="form-control" name="serial_${i}" required />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Código Interno <span class="required">*</span></label>
                <input type="text" class="form-control" name="codigo_${i}" required />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Observación</label>
                <input type="text" class="form-control" name="observacion_${i}" />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Anotaciones</label>
                <input type="text" class="form-control" name="anotacion_${i}" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label class="form-label">Etiqueta física</label>
                <select class="form-select" name="label_${i}">
                  <option value="bien">Bien</option>
                  <option value="no">No</option>
                  <option value="dañada">Dañada</option>
                </select>
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Resguardante <span class="required">*</span></label>
                <select class="form-select guardian-select" name="resguardante_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Área <span class="required">*</span></label>
                <select class="form-select area-select" name="area_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
              <div class="form-group mb-3">
                <label class="form-label">Ubicación <span class="required">*</span></label>
                <select class="form-select location-select" name="ubicacion_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group mb-3">
                <label class="form-label">Laboratorio <span class="required">*</span></label>
                <select class="form-select lab-select" name="laboratorio_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group mb-3">
                <label class="form-label">Pendiente <span class="required">*</span></label>
                <select class="form-select pending-select" name="pendiente_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group mb-3">
                <label class="form-label">Condición <span class="required">*</span></label>
                <select class="form-select status-select" name="condicion_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group mb-3">
                <label class="form-label">Estado <span class="required">*</span></label>
                <select class="form-select disabled-select" name="estado_${i}" required>
                  <option value="">Cargando...</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(div);
    }

    // Llenar selects repetidos (guardians, areas, locations, labs)
    const guardianSelects = container.querySelectorAll('.guardian-select');
    for (const sel of guardianSelects) await fillGuardians(sel);
    
    const areaSelects = container.querySelectorAll('.area-select');
    for (const sel of areaSelects) await fillSelect(sel, selectors.area);
    
    const locationSelects = container.querySelectorAll('.location-select');
    for (const sel of locationSelects) await fillSelect(sel, selectors.ubicacion);
    
    const labSelects = container.querySelectorAll('.lab-select');
    for (const sel of labSelects) await fillSelect(sel, selectors.laboratorio);
    
    const pendingSelects = container.querySelectorAll('.pending-select');
    for (const sel of pendingSelects) await fillSelect(sel, selectors.pendiente);
    
    const statusSelects = container.querySelectorAll('.status-select');
    for (const sel of statusSelects) await fillSelect(sel, selectors.condicion);
    
    const disabledSelects = container.querySelectorAll('.disabled-select');
    for (const sel of disabledSelects) await fillSelect(sel, selectors.estado);

    // Mostrar paso 2 y ocultar paso1
    document.getElementById('step1').classList.add('d-none');
    document.getElementById('step2').classList.remove('d-none');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
  } catch (error) {
    showMessage(`Error al preparar el formulario: ${error.message}`, 'error');
  } finally {
    // Restaurar botón
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Volver al paso 1
document.getElementById('backTo1').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('step2').classList.add('d-none');
  document.getElementById('step1').classList.remove('d-none');
  document.getElementById('messages').innerHTML = '';
  window.scrollTo(0, 0);
});

// Enviar todo
document.getElementById('submitAll').addEventListener('click', async (e) => {
  e.preventDefault();
  document.getElementById('messages').innerHTML = '';
  const output = document.getElementById('output');
  output.innerHTML = '';

  // Mostrar loading
  const btn = document.getElementById('submitAll');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';
  btn.disabled = true;

  try {
    // Recolectar paso 1
    const nombre = document.getElementById('nombre').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value;
    const marca = document.getElementById('marca').value;
    const especificaciones = document.getElementById('especificaciones').value.trim();
    const unidades = parseInt(document.getElementById('unidades').value, 10);
    const fotoInput = document.getElementById('foto');
    const fotoNombre = fotoInput.files[0] ? fotoInput.files[0].name : '';
    const pendiente = document.getElementById('pendiente').value;
    const condicion = document.getElementById('condicion').value;
    const estado = document.getElementById('estado').value;

    // Validación básica
    if (!nombre || !modelo || !descripcion || !categoria || !marca || !especificaciones || isNaN(unidades) || unidades < 1 || !pendiente || !condicion || !estado) {
      showMessage('Faltan datos obligatorios del producto.', 'error');
      return;
    }

    // 1. Crear inventory
    const inventoryPayload = {
      name: nombre,
      model: modelo,
      description: descripcion,
      specs: especificaciones,
      picture: fotoNombre,
      fk_category: parseInt(categoria, 10),
      fk_brand: parseInt(marca, 10),
      UnitsCount: unidades,
    };

    let invResp;
    try {
      const resp = await fetch(`${API_BASE}/inventories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryPayload)
      });
      invResp = await resp.json();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    } catch (err) {
      showMessage(`Error creando inventory: ${err.message}`, 'error');
      return;
    }

    const id_product = invResp.id_product;
    if (!id_product) {
      showMessage('No se recibió ID del inventory creado.', 'error');
      console.log('Respuesta completa inventory:', invResp);
      return;
    }
    showMessage(`Inventory creado con ID ${id_product}`, 'success');

    // 2. Crear cada unidad
    const unitsContainer = document.getElementById('unitsContainer');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i <= unidades; i++) {
      const serial = unitsContainer.querySelector(`[name=serial_${i}]`).value.trim();
      const codigo = unitsContainer.querySelector(`[name=codigo_${i}]`).value.trim();
      const observacion = unitsContainer.querySelector(`[name=observacion_${i}]`).value.trim();
      const anotacion = unitsContainer.querySelector(`[name=anotacion_${i}]`).value.trim();
      const label = unitsContainer.querySelector(`[name=label_${i}]`).value;
      const resguardante = unitsContainer.querySelector(`[name=resguardante_${i}]`).value;
      const area = unitsContainer.querySelector(`[name=area_${i}]`).value;
      const ubicacion = unitsContainer.querySelector(`[name=ubicacion_${i}]`).value;
      const laboratorio = unitsContainer.querySelector(`[name=laboratorio_${i}]`).value;
      const pending = unitsContainer.querySelector(`[name=pendiente_${i}]`).value;
      const status = unitsContainer.querySelector(`[name=condicion_${i}]`).value;
      const disabled = unitsContainer.querySelector(`[name=estado_${i}]`).value;

      if (!serial || !codigo || !resguardante || !area || !ubicacion || !laboratorio || !disabled || !pending || !status) {
        showMessage(`Unidad ${i}: faltan campos obligatorios, se omite.`, 'error');
        errorCount++;
        continue;
      }

      const unitPayload = {
        fk_inventory: parseInt(id_product, 10),
        serial_number: serial,
        internal_code: codigo,
        observations: observacion,
        notes: anotacion,
        fk_disabled: parseInt(disabled, 10), 
        fk_pending: parseInt(pending, 10),
        fk_laboratory: parseInt(laboratorio, 10),
        fk_location: parseInt(ubicacion, 10),
        fk_guardian: parseInt(resguardante, 10),
        fk_area: parseInt(area, 10),
        fk_status_label: parseInt(status, 10),
      };

      try {
        const resp = await fetch(`${API_BASE}/product_units`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unitPayload)
        });
        const unitResp = await resp.json();
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        showMessage(`Unidad ${i} creada correctamente.`, 'success');
        successCount++;
      } catch (err) {
        showMessage(`Error creando unidad ${i}: ${err.message}`, 'error');
        console.log(`Payload unidad ${i}: `, unitPayload);
        errorCount++;
      }
    }

    // Mostrar resumen en el output
    output.innerHTML = `
      <div class="alert alert-info">
        <h5><i class="fas fa-info-circle me-2"></i>Resumen del proceso</h5>
        <ul class="mb-0">
          <li><strong>Producto creado:</strong> ${nombre} (ID: ${id_product})</li>
          <li><strong>Unidades procesadas:</strong> ${unidades}</li>
          <li><strong>Unidades creadas exitosamente:</strong> ${successCount}</li>
          <li><strong>Unidades con errores:</strong> ${errorCount}</li>
        </ul>
      </div>
    `;

    // Mostrar resultado
    document.getElementById('step2').classList.add('d-none');
    document.getElementById('result').classList.remove('d-none');
    window.scrollTo(0, 0);

  } catch (error) {
    showMessage(`Error general en el proceso: ${error.message}`, 'error');
  } finally {
    // Restaurar botón
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});