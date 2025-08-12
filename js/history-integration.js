// Script para integrar el historial con las funciones existentes del sistema
// Este archivo debe cargarse después de script.js y history-manager.js

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se cargue el historial manager
    setTimeout(() => {
        if (window.historyManager) {
            integrateWithExistingFunctions();
        }
    }, 1500);
});

function integrateWithExistingFunctions() {
    console.log('Integrando sistema de historial...');
    
    // Función original de desactivar productos (si existe)
    if (typeof window.desactivarProductosSeleccionados !== 'undefined') {
        const originalDeactivate = window.desactivarProductosSeleccionados;
        window.desactivarProductosSeleccionados = async function() {
            const selectedItems = getSelectedItemsData();
            
            if (selectedItems.length === 0) {
                Swal.fire('Atención', 'Por favor selecciona al menos un producto', 'warning');
                return;
            }

            // Mostrar diálogo de confirmación con razón
            const { value: reason } = await Swal.fire({
                title: 'Desactivar productos',
                text: `¿Estás seguro de desactivar ${selectedItems.length} producto(s)?`,
                input: 'textarea',
                inputLabel: 'Motivo de desactivación (opcional)',
                inputPlaceholder: 'Describe el motivo de la desactivación...',
                showCancelButton: true,
                confirmButtonText: 'Desactivar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc3545'
            });

            if (reason !== undefined) {
                try {
                    // Ejecutar desactivación original (si existe la implementación)
                    if (originalDeactivate && typeof originalDeactivate === 'function') {
                        await originalDeactivate();
                    }
                    
                    // Registrar en historial
                    const unitIds = selectedItems.map(item => item.id_unit);
                    await window.historyManager.logBulkActions('PRODUCT_DEACTIVATED', unitIds, {
                        reason: reason || 'Sin motivo especificado',
                        itemsCount: selectedItems.length
                    });

                    // Actualizar estado en la tabla
                    selectedItems.forEach(item => {
                        updateItemStatusInTable(item.id_unit, 'DESACTIVADO');
                    });

                    // Limpiar selección
                    clearAllSelections();

                    Swal.fire('Éxito', `${selectedItems.length} producto(s) desactivado(s) correctamente`, 'success');

                } catch (error) {
                    console.error('Error en desactivación:', error);
                    Swal.fire('Error', 'Error al desactivar productos', 'error');
                }
            }
        };
    } else {
        // Si no existe, crear la función
        window.desactivarProductosSeleccionados = async function() {
            const selectedItems = getSelectedItemsData();
            
            if (selectedItems.length === 0) {
                Swal.fire('Atención', 'Por favor selecciona al menos un producto', 'warning');
                return;
            }

            const { value: reason } = await Swal.fire({
                title: 'Desactivar productos',
                text: `¿Estás seguro de desactivar ${selectedItems.length} producto(s)?`,
                input: 'textarea',
                inputLabel: 'Motivo de desactivación (opcional)',
                inputPlaceholder: 'Describe el motivo de la desactivación...',
                showCancelButton: true,
                confirmButtonText: 'Desactivar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc3545'
            });

            if (reason !== undefined) {
                try {
                    // Simular desactivación (aquí deberías hacer la llamada real a tu API)
                    console.log('Desactivando productos:', selectedItems.map(i => i.id_unit));
                    
                    // Registrar en historial
                    const unitIds = selectedItems.map(item => item.id_unit);
                    await window.historyManager.logBulkActions('PRODUCT_DEACTIVATED', unitIds, {
                        reason: reason || 'Sin motivo especificado',
                        itemsCount: selectedItems.length
                    });

                    // Actualizar estado en la tabla
                    selectedItems.forEach(item => {
                        updateItemStatusInTable(item.id_unit, 'DESACTIVADO');
                    });

                    // Limpiar selección
                    clearAllSelections();

                    Swal.fire('Éxito', `${selectedItems.length} producto(s) desactivado(s) correctamente`, 'success');

                } catch (error) {
                    console.error('Error en desactivación:', error);
                    Swal.fire('Error', 'Error al desactivar productos', 'error');
                }
            }
        };
    }

    // Integrar función de solicitar préstamo
    if (typeof window.solicitarPrestamo !== 'undefined') {
        const originalLoan = window.solicitarPrestamo;
        window.solicitarPrestamo = async function() {
            const selectedItems = getSelectedItemsData();
            
            if (selectedItems.length === 0) {
                Swal.fire('Atención', 'Por favor selecciona al menos un producto', 'warning');
                return;
            }

            const { value: formValues } = await Swal.fire({
                title: 'Solicitar Préstamo',
                html: `
                    <div class="mb-3">
                        <label for="borrower" class="form-label">Nombre del solicitante:</label>
                        <input type="text" id="borrower" class="form-control" placeholder="Nombre completo" required>
                    </div>
                    <div class="mb-3">
                        <label for="loanDate" class="form-label">Fecha de préstamo:</label>
                        <input type="date" id="loanDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="mb-3">
                        <label for="returnDate" class="form-label">Fecha esperada de devolución:</label>
                        <input type="date" id="returnDate" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="purpose" class="form-label">Propósito del préstamo:</label>
                        <textarea id="purpose" class="form-control" placeholder="Describe el uso del producto..."></textarea>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Solicitar Préstamo',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        borrower: document.getElementById('borrower').value,
                        loanDate: document.getElementById('loanDate').value,
                        returnDate: document.getElementById('returnDate').value,
                        purpose: document.getElementById('purpose').value
                    };
                }
            });

            if (formValues && formValues.borrower && formValues.loanDate && formValues.returnDate) {
                try {
                    // Ejecutar función original si existe
                    if (originalLoan && typeof originalLoan === 'function') {
                        await originalLoan(formValues);
                    }
                    
                    // Registrar en historial
                    for (const item of selectedItems) {
                        await window.historyManager.logLoanRequest(item.id_unit, item, formValues);
                    }

                    // Actualizar estado en la tabla
                    selectedItems.forEach(item => {
                        updateItemStatusInTable(item.id_unit, 'PRESTADO');
                    });

                    // Limpiar selección
                    clearAllSelections();

                    Swal.fire('Éxito', `Préstamo solicitado para ${selectedItems.length} producto(s)`, 'success');

                } catch (error) {
                    console.error('Error en solicitud de préstamo:', error);
                    Swal.fire('Error', 'Error al procesar la solicitud de préstamo', 'error');
                }
            }
        };
    } else {
        // Crear función si no existe
        window.solicitarPrestamo = async function() {
            const selectedItems = getSelectedItemsData();
            
            if (selectedItems.length === 0) {
                Swal.fire('Atención', 'Por favor selecciona al menos un producto', 'warning');
                return;
            }

            const { value: formValues } = await Swal.fire({
                title: 'Solicitar Préstamo',
                html: `
                    <div class="mb-3">
                        <label for="borrower" class="form-label">Nombre del solicitante:</label>
                        <input type="text" id="borrower" class="form-control" placeholder="Nombre completo" required>
                    </div>
                    <div class="mb-3">
                        <label for="loanDate" class="form-label">Fecha de préstamo:</label>
                        <input type="date" id="loanDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="mb-3">
                        <label for="returnDate" class="form-label">Fecha esperada de devolución:</label>
                        <input type="date" id="returnDate" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="purpose" class="form-label">Propósito del préstamo:</label>
                        <textarea id="purpose" class="form-control" placeholder="Describe el uso del producto..."></textarea>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Solicitar Préstamo',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        borrower: document.getElementById('borrower').value,
                        loanDate: document.getElementById('loanDate').value,
                        returnDate: document.getElementById('returnDate').value,
                        purpose: document.getElementById('purpose').value
                    };
                }
            });

            if (formValues && formValues.borrower && formValues.loanDate && formValues.returnDate) {
                try {
                    // Registrar en historial
                    for (const item of selectedItems) {
                        await window.historyManager.logLoanRequest(item.id_unit, item, formValues);
                    }

                    // Actualizar estado en la tabla
                    selectedItems.forEach(item => {
                        updateItemStatusInTable(item.id_unit, 'PRESTADO');
                    });

                    // Limpiar selección
                    clearAllSelections();

                    Swal.fire('Éxito', `Préstamo solicitado para ${selectedItems.length} producto(s)`, 'success');

                } catch (error) {
                    console.error('Error en solicitud de préstamo:', error);
                    Swal.fire('Error', 'Error al procesar la solicitud de préstamo', 'error');
                }
            }
        };
    }

    // Integrar función de editar productos
    if (typeof window.editSelectedProducts !== 'undefined') {
        const originalEdit = window.editSelectedProducts;
        window.editSelectedProducts = async function() {
            const selectedItems = getSelectedItemsData();
            
            if (selectedItems.length === 0) {
                Swal.fire('Atención', 'Por favor selecciona al menos un producto', 'warning');
                return;
            }

            if (selectedItems.length > 1) {
                Swal.fire('Atención', 'Solo puedes editar un producto a la vez', 'warning');
                return;
            }

            const item = selectedItems[0];
            const oldData = { ...item };

            // Crear formulario de edición
            const { value: formValues } = await Swal.fire({
                title: 'Editar Producto',
                html: `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="editName" class="form-label">Nombre:</label>
                            <input type="text" id="editName" class="form-control" value="${item.ProductInfo.name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editModel" class="form-label">Modelo:</label>
                            <input type="text" id="editModel" class="form-control" value="${item.ProductInfo.model}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editLocation" class="form-label">Edificio:</label>
                            <input type="text" id="editLocation" class="form-control" value="${item.LocationInfo.location_name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editArea" class="form-label">Área:</label>
                            <input type="text" id="editArea" class="form-control" value="${item.LabInfo.lab_name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editStatus" class="form-label">Estado:</label>
                            <select id="editStatus" class="form-control" required>
                                <option value="BUENO" ${item.Status === 'BUENO' ? 'selected' : ''}>Bueno</option>
                                <option value="REGULAR" ${item.Status === 'REGULAR' ? 'selected' : ''}>Regular</option>
                                <option value="MALO" ${item.Status === 'MALO' ? 'selected' : ''}>Malo</option>
                                <option value="ACTIVO" ${item.Status === 'ACTIVO' ? 'selected' : ''}>Activo</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editGuardian" class="form-label">Resguardante:</label>
                            <input type="text" id="editGuardian" class="form-control" value="${item.GuardianInfo.name}" required>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="editObservations" class="form-label">Observaciones:</label>
                            <textarea id="editObservations" class="form-control" rows="3">${item.observations || ''}</textarea>
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar Cambios',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        name: document.getElementById('editName').value,
                        model: document.getElementById('editModel').value,
                        location: document.getElementById('editLocation').value,
                        area: document.getElementById('editArea').value,
                        status: document.getElementById('editStatus').value,
                        guardian: document.getElementById('editGuardian').value,
                        observations: document.getElementById('editObservations').value
                    };
                }
            });

            if (formValues) {
                try {
                    // Ejecutar función original si existe
                    if (originalEdit && typeof originalEdit === 'function') {
                        await originalEdit(formValues);
                    }
                    
                    // Crear datos nuevos para comparación
                    const newData = {
                        name: formValues.name,
                        model: formValues.model,
                        location: formValues.location,
                        area: formValues.area,
                        status: formValues.status,
                        guardian: formValues.guardian,
                        observations: formValues.observations
                    };

                    // Registrar cambios en historial
                    await window.historyManager.logProductUpdate(item.id_unit, oldData, newData);

                    // Actualizar datos en la tabla
                    updateItemDataInTable(item.id_unit, formValues);

                    // Limpiar selección
                    clearAllSelections();

                    Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');

                } catch (error) {
                    console.error('Error en edición:', error);
                    Swal.fire('Error', 'Error al actualizar el producto', 'error');
                }
            }
        };
    } else {
        // Crear función si no existe
        window.editSelectedProducts = async function() {
            const selectedItems = getSelectedItemsData();
            
            if (selectedItems.length === 0) {
                Swal.fire('Atención', 'Por favor selecciona al menos un producto', 'warning');
                return;
            }

            if (selectedItems.length > 1) {
                Swal.fire('Atención', 'Solo puedes editar un producto a la vez', 'warning');
                return;
            }

            const item = selectedItems[0];
            const oldData = { ...item };

            const { value: formValues } = await Swal.fire({
                title: 'Editar Producto',
                html: `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="editName" class="form-label">Nombre:</label>
                            <input type="text" id="editName" class="form-control" value="${item.ProductInfo.name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editModel" class="form-label">Modelo:</label>
                            <input type="text" id="editModel" class="form-control" value="${item.ProductInfo.model}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editLocation" class="form-label">Edificio:</label>
                            <input type="text" id="editLocation" class="form-control" value="${item.LocationInfo.location_name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editArea" class="form-label">Área:</label>
                            <input type="text" id="editArea" class="form-control" value="${item.LabInfo.lab_name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editStatus" class="form-label">Estado:</label>
                            <select id="editStatus" class="form-control" required>
                                <option value="BUENO" ${item.Status === 'BUENO' ? 'selected' : ''}>Bueno</option>
                                <option value="REGULAR" ${item.Status === 'REGULAR' ? 'selected' : ''}>Regular</option>
                                <option value="MALO" ${item.Status === 'MALO' ? 'selected' : ''}>Malo</option>
                                <option value="ACTIVO" ${item.Status === 'ACTIVO' ? 'selected' : ''}>Activo</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editGuardian" class="form-label">Resguardante:</label>
                            <input type="text" id="editGuardian" class="form-control" value="${item.GuardianInfo.name}" required>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="editObservations" class="form-label">Observaciones:</label>
                            <textarea id="editObservations" class="form-control" rows="3">${item.observations || ''}</textarea>
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar Cambios',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        name: document.getElementById('editName').value,
                        model: document.getElementById('editModel').value,
                        location: document.getElementById('editLocation').value,
                        area: document.getElementById('editArea').value,
                        status: document.getElementById('editStatus').value,
                        guardian: document.getElementById('editGuardian').value,
                        observations: document.getElementById('editObservations').value
                    };
                }
            });

            if (formValues) {
                try {
                    const newData = {
                        name: formValues.name,
                        model: formValues.model,
                        location: formValues.location,
                        area: formValues.area,
                        status: formValues.status,
                        guardian: formValues.guardian,
                        observations: formValues.observations
                    };

                    // Registrar cambios en historial
                    await window.historyManager.logProductUpdate(item.id_unit, oldData, newData);

                    // Actualizar datos en la tabla
                    updateItemDataInTable(item.id_unit, formValues);

                    clearAllSelections();
                    Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');

                } catch (error) {
                    console.error('Error en edición:', error);
                    Swal.fire('Error', 'Error al actualizar el producto', 'error');
                }
            }
        };
    }

    // Integrar con botón de desactivar existente
    const desactivarBtn = document.getElementById('desactivarBtn');
    if (desactivarBtn) {
        // Remover listeners existentes
        desactivarBtn.removeEventListener('click', window.desactivarProductosSeleccionados);
        // Agregar nuevo listener
        desactivarBtn.addEventListener('click', window.desactivarProductosSeleccionados);
    }

    console.log('Sistema de historial integrado correctamente');
}

// Función auxiliar para obtener datos de elementos seleccionados
function getSelectedItemsData() {
    const selectedRows = document.querySelectorAll('input[type="checkbox"]:checked');
    const items = [];
    
    selectedRows.forEach(checkbox => {
        if (!checkbox.closest('th')) { // Excluir el checkbox del header
            const row = checkbox.closest('tr');
            if (row && row.getAttribute('data-id')) {
                const unitId = row.getAttribute('data-id');
                
                // Buscar los datos del item en el inventario actual
                const allData = window.getInventoryData ? window.getInventoryData() : [];
                const itemData = allData.find(item => item.id_unit.toString() === unitId);
                
                if (itemData) {
                    items.push(itemData);
                }
            }
        }
    });
    
    return items;
}

// Función para actualizar el estado de un elemento en la tabla
function updateItemStatusInTable(unitId, newStatus) {
    const rows = document.querySelectorAll(`tr[data-id="${unitId}"]`);
    rows.forEach(row => {
        const statusCell = row.querySelector('.col-articulo + td + td + td + td'); // Celda de estado
        if (statusCell) {
            const statusBadge = statusCell.querySelector('.badge-status');
            if (statusBadge) {
                statusBadge.textContent = newStatus;
                statusBadge.className = 'badge-status ' + (newStatus === 'DESACTIVADO' ? 'status-bad' : 'status-good');
            }
        }
    });
}

// Función para actualizar datos completos de un elemento en la tabla
function updateItemDataInTable(unitId, newData) {
    const rows = document.querySelectorAll(`tr[data-id="${unitId}"]`);
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) {
            // Actualizar nombre del producto
            const articleCell = cells[2];
            if (articleCell && newData.name) {
                articleCell.textContent = newData.name;
            }
            
            // Actualizar modelo
            const modelCell = cells[3];
            if (modelCell && newData.model) {
                modelCell.textContent = newData.model;
            }
            
            // Actualizar edificio
            const buildingCell = cells[4];
            if (buildingCell && newData.location) {
                buildingCell.textContent = newData.location;
            }
            
            // Actualizar área
            const areaCell = cells[5];
            if (areaCell && newData.area) {
                areaCell.textContent = newData.area;
            }
            
            // Actualizar estado
            const statusCell = cells[6];
            if (statusCell && newData.status) {
                const statusBadge = statusCell.querySelector('.badge-status');
                if (statusBadge) {
                    statusBadge.textContent = newData.status;
                    // Actualizar clase según el estado
                    statusBadge.className = 'badge-status ' + getStatusClass(newData.status);
                }
            }
        }
    });

    // También actualizar datos en el array global si existe
    if (window.getInventoryData) {
        const allData = window.getInventoryData();
        const itemIndex = allData.findIndex(item => item.id_unit.toString() === unitId.toString());
        
        if (itemIndex !== -1) {
            if (newData.name) allData[itemIndex].ProductInfo.name = newData.name;
            if (newData.model) allData[itemIndex].ProductInfo.model = newData.model;
            if (newData.location) allData[itemIndex].LocationInfo.location_name = newData.location;
            if (newData.area) allData[itemIndex].LabInfo.lab_name = newData.area;
            if (newData.status) allData[itemIndex].Status = newData.status;
            if (newData.guardian) allData[itemIndex].GuardianInfo.name = newData.guardian;
            if (newData.observations !== undefined) allData[itemIndex].observations = newData.observations;
        }
    }
}

// Función auxiliar para obtener clase CSS según el estado
function getStatusClass(status) {
    switch (status.toUpperCase()) {
        case 'BUENO':
        case 'ACTIVO':
            return 'status-good';
        case 'REGULAR':
            return 'status-pending';
        case 'MALO':
        case 'DESACTIVADO':
            return 'status-bad';
        default:
            return 'status-pending';
    }
}

// Función para limpiar todas las selecciones
function clearAllSelections() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Actualizar contador de selección si existe
    if (window.updateSelectionCount) {
        window.updateSelectionCount();
    }
}

// Función para registrar creación de nuevos productos (para integrar con formulario de productos)
window.logProductCreation = async function(productData, unitId) {
    if (window.historyManager) {
        await window.historyManager.logProductCreation(unitId, productData);
    }
};

// Función para registrar cambios de ubicación
window.logLocationChange = async function(unitId, oldLocation, newLocation, productData) {
    if (window.historyManager) {
        await window.historyManager.logLocationChange(unitId, productData, oldLocation, newLocation);
    }
};

// Función para registrar cambios de estado
window.logStatusChange = async function(unitId, oldStatus, newStatus, productData) {
    if (window.historyManager) {
        await window.historyManager.logStatusChange(unitId, productData, oldStatus, newStatus);
    }
};

// Función para registrar revisiones/checks
window.logCheckPerformed = async function(unitId, productData, checkResults) {
    if (window.historyManager) {
        await window.historyManager.logCheckPerformed(unitId, productData, checkResults);
    }
};

// Función para registrar devolución de préstamos
window.logLoanReturn = async function(unitId, productData, returnDetails) {
    if (window.historyManager) {
        await window.historyManager.logLoanReturn(unitId, productData, returnDetails);
    }
};

// Interceptar cambios en checkboxes para habilitar/deshabilitar botones
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox' && e.target.closest('tbody')) {
        updateActionButtons();
    }
});

// Función para actualizar estado de botones de acción
function updateActionButtons() {
    const selectedItems = getSelectedItemsData();
    const hasSelection = selectedItems.length > 0;
    
    const buttons = ['desactivarBtn', 'editBtn', 'loanBtn'];
    buttons.forEach(btnId => {
        const button = document.getElementById(btnId);
        if (button) {
            button.disabled = !hasSelection;
        }
    });
    
    // Botón de editar solo se habilita con una selección
    const editButton = document.getElementById('editBtn');
    if (editButton) {
        editButton.disabled = selectedItems.length !== 1;
    }
}

// Agregar indicador visual de elementos con historial
function addHistoryIndicators() {
    if (!window.historyManager) return;
    
    const rows = document.querySelectorAll('tr[data-id]');
    rows.forEach(async (row) => {
        const unitId = row.getAttribute('data-id');
        try {
            const history = await window.historyManager.getHistoryByUnit(unitId);
            if (history && history.length > 1) {
                // Agregar indicador de que el producto tiene historial
                const firstCell = row.querySelector('td:first-child');
                if (firstCell && !firstCell.querySelector('.history-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'history-indicator';
                    indicator.innerHTML = '<i class="fas fa-history text-primary" title="Este producto tiene historial"></i>';
                    indicator.style.cssText = 'margin-left: 5px; cursor: pointer;';
                    
                    indicator.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showProductHistory(unitId);
                    });
                    
                    firstCell.appendChild(indicator);
                }
            }
        } catch (error) {
            // Ignorar errores de historial individual
        }
    });
}

// Función para mostrar historial de un producto específico
async function showProductHistory(unitId) {
    try {
        const history = await window.historyManager.getHistoryByUnit(unitId);
        
        if (!history || history.length === 0) {
            Swal.fire('Información', 'Este producto no tiene historial registrado', 'info');
            return;
        }

        const historyHtml = history.slice(0, 10).map(h => {
            let details = {};
            try {
                details = JSON.parse(h.actionDetails);
            } catch (e) {
                details = {};
            }
            
            const actionDescription = window.historyManager.getActionDescription(h.actionType);
            const actionIcon = window.historyManager.getActionIcon(h.actionType);
            const formattedDate = window.historyManager.formatDate(h.actionDate);
            
            return `
                <div class="border-bottom pb-2 mb-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <i class="${actionIcon} me-2"></i>
                            <strong>${actionDescription}</strong>
                            ${details.userName ? `<small class="text-muted"> - ${details.userName}</small>` : ''}
                        </div>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                    ${details.reason ? `<div class="text-muted small mt-1">Motivo: ${details.reason}</div>` : ''}
                </div>
            `;
        }).join('');

        await Swal.fire({
            title: `Historial - Producto #${unitId}`,
            html: `
                <div class="text-start">
                    ${historyHtml}
                    ${history.length > 10 ? '<div class="text-center text-muted mt-3"><small>Mostrando los últimos 10 registros</small></div>' : ''}
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Cerrar'
        });

    } catch (error) {
        console.error('Error al mostrar historial:', error);
        Swal.fire('Error', 'No se pudo cargar el historial del producto', 'error');
    }
}

// Ejecutar indicadores después de que se cargue la tabla
setTimeout(() => {
    if (document.querySelector('tbody tr[data-id]')) {
        addHistoryIndicators();
    }
}, 3000);

// Re-ejecutar indicadores cuando se actualice la tabla
const originalRenderTable = window.renderTable;
if (originalRenderTable) {
    window.renderTable = function(...args) {
        const result = originalRenderTable.apply(this, args);
        setTimeout(addHistoryIndicators, 1000);
        return result;
    };
}