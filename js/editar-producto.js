// Configuración de endpoints
const API_BASE = `https://healtyapi.bsite.net/api`;
const selectors = {
  categoria: { url: `${API_BASE}/categories`, id: 'id_category', name: 'category_name'},
  marca: { url: `${API_BASE}/brands`, id: 'id_brand', name: 'brand_name' },
  area: { url: `${API_BASE}/areas`, id: 'id_area', name: 'area_name' },
  ubicacion: { url: `${API_BASE}/location_`, id: 'id_location', name: 'location_name' },
  laboratorio: { url: `${API_BASE}/laboratories`, id: 'id_lab', name: 'lab_name' },
  condicion: { url: `${API_BASE}/status_l`, id: 'id_status_label', name: 'status_label' },
};

// Variables globales
let selectedProductIds = [];
let currentProductIndex = 0;
let productsData = [];
let defaultPendienteId = null;
let defaultEstadoId = null;

// Funciones de utilidad
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status} al pedir ${url}`);
    return res.json();
  } catch (error) {
    console.error('Error en fetchJSON:', error);
    throw error;
  }
}

async function fillSelect(selectEl, endpointInfo, placeholder = '--Selecciona--') {
  if (!selectEl) {
    console.error('Select element no encontrado');
    return;
  }
  
  try {
    const data = await fetchJSON(endpointInfo.url);
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => {
        const id = item[endpointInfo.id];
        const name = item[endpointInfo.name];
        if (id !== undefined && name !== undefined) {
          const opt = document.createElement('option');
          opt.value = id;
          opt.textContent = name;
          selectEl.appendChild(opt);
        }
      });
    }
  } catch (e) {
    selectEl.innerHTML = `<option value="">Error cargando</option>`;
    showMessage(`No se pudieron cargar datos de ${endpointInfo.url}: ${e.message}`, 'error');
  }
}

async function fillGuardians(selectEl) {
  if (!selectEl) {
    console.error('Guardian select element no encontrado');
    return;
  }
  
  try {
    const data = await fetchJSON(`${API_BASE}/users`);
    selectEl.innerHTML = `<option value="">--Selecciona--</option>`;
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(u => {
        const rol = u?.RoleInfo?.rol || '';
        if (rol.toLowerCase() === 'alumno') return;
        const id = u.id_user;
        const name = u.name;
        if (id !== undefined && name !== undefined) {
          const opt = document.createElement('option');
          opt.value = id;
          opt.textContent = name;
          selectEl.appendChild(opt);
        }
      });
    }
  } catch (e) {
    selectEl.innerHTML = `<option value="">Error cargando guardianes</option>`;
    showMessage(`Error cargando guardianes: ${e.message}`, 'error');
  }
}

function showMessage(msg, type = 'info') {
  const messagesContainer = document.getElementById('messages');
  if (!messagesContainer) {
    console.error('Messages container no encontrado');
    return;
  }
  
  const div = document.createElement('div');
  
  setTimeout(() => {
    if (div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }, 5000);
  
  div.textContent = msg;
  
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

// Cargar valores por defecto para pendiente y estado
async function loadDefaults() {
  try {
    // Cargar pendientes para obtener "realizado"
    const pendientesData = await fetchJSON(`${API_BASE}/pendings`);
    if (Array.isArray(pendientesData)) {
      const realizadoItem = pendientesData.find(item => 
        item.status_p && item.status_p.toLowerCase().includes('realizado')
      );
      if (realizadoItem) {
        defaultPendienteId = realizadoItem.id_pending;
      }
    }

    // Cargar estados para obtener "activo"
    const estadosData = await fetchJSON(`${API_BASE}/disabled_`);
    if (Array.isArray(estadosData)) {
      const activoItem = estadosData.find(item => 
        item.status_d && item.status_d.toLowerCase().includes('activo')
      );
      if (activoItem) {
        defaultEstadoId = activoItem.id_disable;
      }
    }
  } catch (error) {
    console.error('Error cargando valores por defecto:', error);
  }
}

// Cargar datos de un producto específico
async function loadProductData(productId) {
  try {
    // Cargar datos del inventario
    const inventoryData = await fetchJSON(`${API_BASE}/inventories/${productId}`);
    
    // Cargar unidades del producto - FIX: cambiar la URL para que funcione
    let unitsData = [];
    try {
      unitsData = await fetchJSON(`${API_BASE}/product_units/byProduct/${productId}`);
    } catch (error) {
      console.warn(`No se pudieron cargar unidades para el producto ${productId}:`, error);
      // Intentar con endpoint alternativo
      try {
        const allUnits = await fetchJSON(`${API_BASE}/product_units`);
        unitsData = Array.isArray(allUnits) ? allUnits.filter(unit => unit.fk_inventory === parseInt(productId)) : [];
      } catch (error2) {
        console.error('Error cargando unidades:', error2);
        unitsData = [];
      }
    }
    
    return {
      inventory: inventoryData,
      units: Array.isArray(unitsData) ? unitsData : []
    };
  } catch (error) {
    throw new Error(`Error cargando producto ${productId}: ${error.message}`);
  }
}

// Cargar todos los productos seleccionados
async function loadAllProducts() {
  try {
    const loadingContainer = document.getElementById('loadingContainer');
    const noProductsDiv = document.getElementById('noProductsSelected');
    
    if (!loadingContainer || !noProductsDiv) {
      console.error('Contenedores de carga no encontrados');
      return;
    }

    // Obtener IDs desde localStorage
    const storedIds = localStorage.getItem('selectedProducts');
    if (!storedIds) {
      loadingContainer.classList.add('d-none');
      noProductsDiv.classList.remove('d-none');
      return;
    }
    
    try {
      selectedProductIds = JSON.parse(storedIds);
    } catch (error) {
      console.error('Error parseando IDs almacenados:', error);
      selectedProductIds = [];
    }
    
    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      loadingContainer.classList.add('d-none');
      noProductsDiv.classList.remove('d-none');
      return;
    }

    // Cargar datos de todos los productos
    productsData = [];
    for (const productId of selectedProductIds) {
      try {
        const productData = await loadProductData(productId);
        productsData.push({
          id: productId,
          ...productData
        });
      } catch (error) {
        console.error(`Error cargando producto ${productId}:`, error);
        showMessage(`Error cargando producto ${productId}: ${error.message}`, 'error');
      }
    }

    if (productsData.length === 0) {
      loadingContainer.classList.add('d-none');
      noProductsDiv.classList.remove('d-none');
      return;
    }

    // Mostrar interfaz de edición
    loadingContainer.classList.add('d-none');
    const navigator = document.getElementById('productNavigator');
    const editForm = document.getElementById('editForm');
    
    if (navigator) navigator.classList.remove('d-none');
    if (editForm) editForm.classList.remove('d-none');
    
    // Actualizar navegador
    updateNavigator();
    
    // Mostrar primer producto
    await showProduct(0);
    
  } catch (error) {
    console.error('Error general cargando productos:', error);
    showMessage(`Error general cargando productos: ${error.message}`, 'error');
  }
}

// Actualizar el navegador de productos
function updateNavigator() {
  const totalElement = document.getElementById('totalProducts');
  const currentElement = document.getElementById('currentProductIndex');
  const prevBtn = document.getElementById('prevProduct');
  const nextBtn = document.getElementById('nextProduct');
  
  if (totalElement) totalElement.textContent = productsData.length;
  if (currentElement) currentElement.textContent = currentProductIndex + 1;
  
  // Actualizar botones de navegación
  if (prevBtn) prevBtn.disabled = currentProductIndex === 0;
  if (nextBtn) nextBtn.disabled = currentProductIndex === productsData.length - 1;
  
  // Actualizar info del producto actual
  if (productsData[currentProductIndex]) {
    const currentProduct = productsData[currentProductIndex];
    const idElement = document.getElementById('currentProductId');
    const nameElement = document.getElementById('currentProductName');
    
    if (idElement) idElement.textContent = currentProduct.id;
    if (nameElement) nameElement.textContent = currentProduct.inventory?.name || '-';
  }
}

// Mostrar un producto específico
async function showProduct(index) {
  if (index < 0 || index >= productsData.length) return;
  
  currentProductIndex = index;
  const productData = productsData[index];
  const inventory = productData.inventory;
  const units = productData.units;
  
  // Limpiar mensajes
  const messagesContainer = document.getElementById('messages');
  if (messagesContainer) messagesContainer.innerHTML = '';
  
  // Llenar datos del inventario
  const campos = [
    { id: 'nombre', value: inventory?.name || '' },
    { id: 'modelo', value: inventory?.model || '' },
    { id: 'descripcion', value: inventory?.description || '' },
    { id: 'especificaciones', value: inventory?.specs || '' },
    { id: 'categoria', value: inventory?.fk_category || '' },
    { id: 'marca', value: inventory?.fk_brand || '' },
    { id: 'condicion', value: inventory?.fk_status_label || '' }
  ];
  
  campos.forEach(campo => {
    const element = document.getElementById(campo.id);
    if (element) element.value = campo.value;
  });
  
  // Mostrar info de foto actual
  const photoInfo = document.getElementById('currentPhotoInfo');
  if (photoInfo) {
    if (inventory?.picture) {
      photoInfo.innerHTML = `<i class="fas fa-image me-2"></i>Foto actual: ${inventory.picture}`;
    } else {
      photoInfo.innerHTML = `<i class="fas fa-image me-2"></i>Sin foto`;
    }
  }
  
  // Cargar unidades
  await loadUnits(units);
  
  // Actualizar navegador
  updateNavigator();
}

// Cargar unidades en el formulario
async function loadUnits(units) {
  const container = document.getElementById('unitsContainer');
  if (!container) {
    console.error('Units container no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  // FIX: Verificar que units sea un array y tenga elementos
  if (!Array.isArray(units) || units.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        Este producto no tiene unidades asociadas.
      </div>
    `;
    return;
  }
  
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const div = document.createElement('div');
    div.className = 'unit-block card mb-4';
    div.setAttribute('data-unit-id', unit.id_product_unit);
    
    div.innerHTML = `
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-cube me-2"></i>
          Unidad ${i + 1} - ID: ${unit.id_product_unit}
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Serial <span class="required">*</span></label>
              <input type="text" class="form-control" name="serial" value="${unit.serial_number || ''}" required />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Código Interno <span class="required">*</span></label>
              <input type="text" class="form-control" name="codigo" value="${unit.internal_code || ''}" required />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Observación</label>
              <input type="text" class="form-control" name="observacion" value="${unit.observations || ''}" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Anotaciones</label>
              <input type="text" class="form-control" name="anotacion" value="${unit.notes || ''}" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Etiqueta física</label>
              <select class="form-select" name="label">
                <option value="bien" ${unit.fk_status_label === 1 ? 'selected' : ''}>Bien</option>
                <option value="no" ${unit.fk_status_label === 2 ? 'selected' : ''}>No</option>
                <option value="dañada" ${unit.fk_status_label === 3 ? 'selected' : ''}>Dañada</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Resguardante <span class="required">*</span></label>
              <select class="form-select guardian-select" name="resguardante" required>
                <option value="">Cargando...</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Área <span class="required">*</span></label>
              <select class="form-select area-select" name="area" required>
                <option value="">Cargando...</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Ubicación <span class="required">*</span></label>
              <select class="form-select location-select" name="ubicacion" required>
                <option value="">Cargando...</option>
              </select>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Laboratorio <span class="required">*</span></label>
              <select class="form-select lab-select" name="laboratorio" required>
                <option value="">Cargando...</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label class="form-label">Condición <span class="required">*</span></label>
              <select class="form-select status-select" name="condicion" required>
                <option value="">Cargando...</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(div);
  }
  
  // Llenar selects de las unidades
  const guardianSelects = container.querySelectorAll('.guardian-select');
  const areaSelects = container.querySelectorAll('.area-select');
  const locationSelects = container.querySelectorAll('.location-select');
  const labSelects = container.querySelectorAll('.lab-select');
  const statusSelects = container.querySelectorAll('.status-select');
  
  // FIX: Usar Promise.all para cargar todos los selects simultáneamente
  try {
    await Promise.all([
      ...Array.from(guardianSelects).map(sel => fillGuardians(sel)),
      ...Array.from(areaSelects).map(sel => fillSelect(sel, selectors.area)),
      ...Array.from(locationSelects).map(sel => fillSelect(sel, selectors.ubicacion)),
      ...Array.from(labSelects).map(sel => fillSelect(sel, selectors.laboratorio)),
      ...Array.from(statusSelects).map(sel => fillSelect(sel, selectors.condicion))
    ]);
  } catch (error) {
    console.error('Error cargando selects de unidades:', error);
  }
  
  // Seleccionar valores actuales después de cargar los selects
  setTimeout(() => {
    units.forEach((unit, index) => {
      const unitBlock = container.children[index];
      if (unitBlock) {
        const guardianSelect = unitBlock.querySelector('.guardian-select');
        const areaSelect = unitBlock.querySelector('.area-select');
        const locationSelect = unitBlock.querySelector('.location-select');
        const labSelect = unitBlock.querySelector('.lab-select');
        const statusSelect = unitBlock.querySelector('.status-select');
        
        if (guardianSelect && unit.fk_guardian) guardianSelect.value = unit.fk_guardian;
        if (areaSelect && unit.fk_area) areaSelect.value = unit.fk_area;
        if (locationSelect && unit.fk_location) locationSelect.value = unit.fk_location;
        if (labSelect && unit.fk_laboratory) labSelect.value = unit.fk_laboratory;
        if (statusSelect && unit.fk_status_label) statusSelect.value = unit.fk_status_label;
      }
    });
  }, 1000);
}

// Guardar producto actual
async function saveCurrentProduct() {
  try {
    if (!productsData[currentProductIndex]) {
      showMessage('No hay producto actual para guardar.', 'error');
      return false;
    }
    
    const currentProduct = productsData[currentProductIndex];
    
    // Recopilar datos del inventario
    const inventoryData = {
      id_product: parseInt(currentProduct.id),
      name: document.getElementById('nombre')?.value?.trim() || '',
      model: document.getElementById('modelo')?.value?.trim() || '',
      description: document.getElementById('descripcion')?.value?.trim() || '',
      specs: document.getElementById('especificaciones')?.value?.trim() || '',
      fk_category: parseInt(document.getElementById('categoria')?.value) || null,
      fk_brand: parseInt(document.getElementById('marca')?.value) || null,
      fk_status_label: parseInt(document.getElementById('condicion')?.value) || null
    };
    
    // Manejar foto si se seleccionó una nueva
    const fotoInput = document.getElementById('foto');
    if (fotoInput && fotoInput.files[0]) {
      inventoryData.picture = fotoInput.files[0].name;
    }
    
    // Validar datos del inventario
    if (!inventoryData.name || !inventoryData.model || !inventoryData.description || 
        !inventoryData.specs || !inventoryData.fk_category || !inventoryData.fk_brand || 
        !inventoryData.fk_status_label) {
      showMessage('Faltan datos obligatorios del producto.', 'error');
      return false;
    }
    
    // Guardar inventario
    const inventoryResponse = await fetch(`${API_BASE}/inventories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inventoryData)
    });
    
    if (!inventoryResponse.ok) {
      throw new Error(`Error actualizando inventario: HTTP ${inventoryResponse.status}`);
    }
    
    // Guardar unidades
    const unitsContainer = document.getElementById('unitsContainer');
    if (unitsContainer) {
      const unitBlocks = unitsContainer.querySelectorAll('.unit-block');
      
      for (const unitBlock of unitBlocks) {
        const unitId = unitBlock.getAttribute('data-unit-id');
        
        const unitData = {
          id_product_unit: parseInt(unitId),
          serial_number: unitBlock.querySelector('[name="serial"]')?.value?.trim() || '',
          internal_code: unitBlock.querySelector('[name="codigo"]')?.value?.trim() || '',
          observations: unitBlock.querySelector('[name="observacion"]')?.value?.trim() || '',
          notes: unitBlock.querySelector('[name="anotacion"]')?.value?.trim() || '',
          fk_status_label: parseInt(unitBlock.querySelector('[name="label"]')?.value) || 1,
          fk_guardian: parseInt(unitBlock.querySelector('[name="resguardante"]')?.value) || null,
          fk_area: parseInt(unitBlock.querySelector('[name="area"]')?.value) || null,
          fk_location: parseInt(unitBlock.querySelector('[name="ubicacion"]')?.value) || null,
          fk_laboratory: parseInt(unitBlock.querySelector('[name="laboratorio"]')?.value) || null,
          fk_disabled: defaultEstadoId,
          fk_pending: defaultPendienteId
        };
        
        // Validar datos de la unidad
        if (!unitData.serial_number || !unitData.internal_code || !unitData.fk_guardian || 
            !unitData.fk_area || !unitData.fk_location || !unitData.fk_laboratory) {
          showMessage(`Unidad ${unitId}: faltan campos obligatorios.`, 'error');
          return false;
        }
        
        const unitResponse = await fetch(`${API_BASE}/product_units/${unitId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unitData)
        });
        
        if (!unitResponse.ok) {
          throw new Error(`Error actualizando unidad ${unitId}: HTTP ${unitResponse.status}`);
        }
      }
    }
    
    showMessage(`Producto ${currentProduct.id} guardado exitosamente.`, 'success');
    return true;
    
  } catch (error) {
    console.error('Error guardando producto:', error);
    showMessage(`Error guardando producto: ${error.message}`, 'error');
    return false;
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Iniciando carga de editar productos...');
    
    // Cargar valores por defecto
    await loadDefaults();
    
    // Cargar selects básicos
    const categoria = document.getElementById('categoria');
    const marca = document.getElementById('marca');
    const condicion = document.getElementById('condicion');
    
    if (categoria) await fillSelect(categoria, selectors.categoria);
    if (marca) await fillSelect(marca, selectors.marca);
    if (condicion) await fillSelect(condicion, selectors.condicion);
    
    // Cargar productos
    await loadAllProducts();
    
    // Event listeners para navegación
    const prevBtn = document.getElementById('prevProduct');
    const nextBtn = document.getElementById('nextProduct');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentProductIndex > 0) {
          showProduct(currentProductIndex - 1);
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentProductIndex < productsData.length - 1) {
          showProduct(currentProductIndex + 1);
        }
      });
    }
    
    // Event listeners para guardado
    const saveBtn = document.getElementById('saveProduct');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';
        saveBtn.disabled = true;
        
        try {
          await saveCurrentProduct();
        } finally {
          saveBtn.innerHTML = originalText;
          saveBtn.disabled = false;
        }
      });
    }
    
    const saveNextBtn = document.getElementById('saveAndNext');
    if (saveNextBtn) {
      saveNextBtn.addEventListener('click', async () => {
        const originalText = saveNextBtn.innerHTML;
        saveNextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';
        saveNextBtn.disabled = true;
        
        try {
          const saved = await saveCurrentProduct();
          if (saved && currentProductIndex < productsData.length - 1) {
            setTimeout(() => {
              showProduct(currentProductIndex + 1);
            }, 1000);
          }
        } finally {
          saveNextBtn.innerHTML = originalText;
          saveNextBtn.disabled = false;
        }
      });
    }
    
    console.log('Editar productos inicializado correctamente');
    
  } catch (error) {
    console.error('Error en la inicialización:', error);
    showMessage(`Error inicializando la página: ${error.message}`, 'error');
  }
});