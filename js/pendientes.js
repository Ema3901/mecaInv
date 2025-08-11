// Función para obtener usuario actual (placeholder)
    function getCurrentUser() {
        // Aquí deberías implementar la lógica para obtener el usuario actual
        // Por ejemplo, desde localStorage, sessionStorage, o un token JWT
        return localStorage.getItem('currentUser') || 'Sistema';
    }/*
 * Sistema de Revisión Semestral de Inventario
 * 
 * Estructura de Foreign Keys:
 * - PendingStatus: 1 = Pendiente, 2 = Realizado
 * - LabelStatus: 1 = Bien, 2 = No, 3 = Dañada
 * - Status: BUENA, DAÑADA (estado físico del producto)
 * - observations: Campo de texto libre para observaciones
 */

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('#pendientesTable tbody');
    const API_BASE_URL = "https://healtyapi.bsite.net/api/product_units";
    
    let pendientes = []; // Array global para manejar los productos pendientes

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Función para obtener productos pendientes con manejo de errores mejorado
    async function obtenerProductosPendientes() {
        try {
            showNotification('Cargando productos pendientes...', 'info');
            
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Datos obtenidos de la API:", data);

            // Filtrar productos pendientes y activos (maneja tanto string como número)
            pendientes = data.filter(item => {
                const isPendiente = 
                    item.PendingStatus === 1 || 
                    item.PendingStatus === "1" ||
                    (typeof item.PendingStatus === 'string' && item.PendingStatus.toLowerCase() === "pendiente");
                
                const isActive = item.Status !== "Deshabilitado";
                
                console.log(`Producto ${item.id_unit}: PendingStatus="${item.PendingStatus}", Status="${item.Status}", isPendiente=${isPendiente}, isActive=${isActive}`);
                
                return isPendiente && isActive;
            });

            console.log("Filtro aplicado - productos que pasaron el filtro:");
            console.log("Productos pendientes:", pendientes.map(p => p.id_unit));

            console.log("Productos pendientes encontrados:", pendientes.length);
            showNotification(`Se encontraron ${pendientes.length} productos pendientes`, 'success');
            
            return pendientes;
            
        } catch (error) {
            console.error("Error al obtener productos:", error);
            showNotification('Error al cargar los productos. Verifica tu conexión.', 'danger');
            return [];
        }
    }

    // Función mejorada para renderizar la tabla
    function renderTabla() {
        tbody.innerHTML = '';

        if (pendientes.length === 0) {
            mostrarMensajeFinal();
            return;
        }

        pendientes.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);
            tr.setAttribute('data-id', item.id_unit);

            // Select para estado del producto con clases CSS
            const selectStatus = createStatusSelect(item.Status, index);
            
            // Select para estado de etiqueta
            const selectLabel = createLabelSelect(item.LabelStatus, index);
            
            // Textarea para observaciones
            const textareaObs = createObservationsTextarea(item.observations || "", index);

            tr.innerHTML = `
                <td class="fw-bold text-primary">${item.id_unit}</td>
                <td>${item.ProductInfo?.name || 'N/A'}</td>
                <td><span class="badge bg-secondary">${item.ProductInfo?.model || 'N/A'}</span></td>
                <td><i class="fas fa-map-marker-alt text-muted me-1"></i>${item.LocationInfo?.location_name || 'N/A'}</td>
                <td><i class="fas fa-flask text-info me-1"></i>${item.LabInfo?.lab_name || 'N/A'}</td>
                <td>${selectStatus}</td>
                <td><span class="badge bg-warning text-dark"><i class="fas fa-clock me-1"></i>PENDIENTE</span></td>
                <td class="label-column">
                    <div class="mb-2">${selectLabel}</div>
                    ${textareaObs}
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-success shadow-sm" onclick="aprobarUno(${index})" title="Aprobar revisión">
                        <i class="fas fa-check me-1"></i> Aprobar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
            
            // Aplicar clase inicial al select de estado
            actualizarClaseSelect(tr.querySelector('.status-select'));
        });

        // Agregar contador de productos pendientes
        agregarContadorPendientes();
    }

    // Crear select de estado con estilos mejorados
    function createStatusSelect(currentStatus, index) {
        return `
        `;
    }

    // Crear select de etiqueta con los valores FK correctos (maneja tanto números como strings)
    function createLabelSelect(currentLabelStatus, index) {
        console.log(`Creando select de etiqueta para índice ${index}, valor actual:`, currentLabelStatus);
        
        // Convertir string a número si es necesario
        let selectedValue = currentLabelStatus;
        if (typeof currentLabelStatus === 'string') {
            switch(currentLabelStatus.toLowerCase()) {
                case 'bien': selectedValue = 1; break;
                case 'no': selectedValue = 2; break;
                case 'dañada': selectedValue = 3; break;
                default: selectedValue = parseInt(currentLabelStatus) || 1;
            }
        }
        
        return `
            <select class="form-select form-select-sm label-select" id="label-${index}">
                <option value="1" ${selectedValue == 1 ? "selected" : ""}>✅ BIEN</option>
                <option value="2" ${selectedValue == 2 ? "selected" : ""}>❌ NO</option>
                <option value="3" ${selectedValue == 3 ? "selected" : ""}>🔧 DAÑADA</option>
            </select>
        `;
    }

    // Crear textarea de observaciones
    function createObservationsTextarea(observations, index) {
        return `
            <textarea class="form-control form-control-sm mt-2" 
                      id="obs-${index}" 
                      rows="2" 
                      placeholder="Escribe observaciones aquí..."
                      maxlength="500">${observations}</textarea>
            <small class="text-muted">Máx. 500 caracteres</small>
        `;
    }

    // Mostrar mensaje cuando no hay productos pendientes
    function mostrarMensajeFinal() {
        const trMensaje = document.createElement('tr');
        trMensaje.id = "rowMensajeFinal";
        trMensaje.innerHTML = `
            <td colspan="9" class="text-center py-5">
                <div class="completion-message">
                    <i class="fas fa-check-circle mb-3 text-success" style="font-size: 4rem;"></i>
                    <h3 class="text-success mt-3 mb-2">¡Revisión Completada!</h3>
                    <p class="text-muted mb-4">Todos los productos han sido revisados exitosamente.<br>
                    La próxima revisión será en ${getNextReviewDate()}.</p>
                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                        <a href="index.html" class="btn btn-primary">
                            <i class="fas fa-arrow-left me-1"></i> Regresar al Inventario
                        </a>
                        <button class="btn btn-outline-success" onclick="generarReporte()">
                            <i class="fas fa-file-alt me-1"></i> Generar Reporte
                        </button>
                        <button class="btn btn-outline-warning" onclick="iniciarNuevaRevision()">
                            <i class="fas fa-refresh me-1"></i> Nueva Revisión
                        </button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trMensaje);
    }

    // Obtener fecha de próxima revisión
    function getNextReviewDate() {
        const now = new Date();
        const currentMonth = now.getMonth();
        let nextReview;
        
        if (currentMonth < 5) { // Antes de junio
            nextReview = new Date(now.getFullYear(), 5, 1); // Junio
        } else if (currentMonth < 11) { // Entre junio y noviembre
            nextReview = new Date(now.getFullYear(), 11, 1); // Diciembre
        } else { // Diciembre
            nextReview = new Date(now.getFullYear() + 1, 5, 1); // Junio del próximo año
        }
        
        return nextReview.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    // Agregar contador de productos pendientes
    function agregarContadorPendientes() {
        const existingCounter = document.getElementById('pendientes-counter');
        if (existingCounter) existingCounter.remove();
        
        const counter = document.createElement('tr');
        counter.id = 'pendientes-counter';
        counter.innerHTML = `
            <td colspan="9" class="bg-light text-center py-2">
                <strong><i class="fas fa-tasks me-1"></i>Productos pendientes: ${pendientes.length}</strong>
            </td>
        `;
        tbody.insertBefore(counter, tbody.firstChild);
    }

    // Función mejorada para actualizar clases de select
    function actualizarClaseSelect(select) {
        select.classList.remove('status-buena', 'status-danada');
        if (select.value === 'BUENA') {
            select.classList.add('status-buena');
        } else if (select.value === 'DAÑADA') {
            select.classList.add('status-danada');
        }
    }

    // Función mejorada para aprobar un producto
    async function aprobarUno(index) {
        try {
            const row = document.querySelector(`tr[data-index="${index}"]`);
            const selectStatus = row.querySelector('.status-select');
            const selectLabel = document.getElementById(`label-${index}`);
            const textareaObs = document.getElementById(`obs-${index}`);

            // Validar que se hayan seleccionado todos los campos requeridos
            if (!selectStatus.value || !selectLabel.value) {
                showNotification('Por favor completa el estado del producto y de la etiqueta', 'warning');
                return;
            }

            // Mostrar indicador de carga
            const approveButton = row.querySelector('button');
            const originalContent = approveButton.innerHTML;
            approveButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Aprobando...';
            approveButton.disabled = true;

            // Preparar datos actualizados - CORREGIDO según la estructura real
            const updatedProduct = {
                ...pendientes[index],
                // Campos confirmados que existen en la API:
                PendingStatus: 2, // FK 2 = Realizado (funciona con IDs numéricos)
                LabelStatus: parseInt(selectLabel.value), // FK para estado de etiqueta
                observations: textareaObs.value.trim() || null,
                
                // IMPORTANTE: ¿Dónde se guarda el estado físico BUENA/DAÑADA?
                // Opciones posibles según tu estructura:
                // Status: selectStatus.value, // Si este campo es para físico
                // O tal vez hay otro campo como physical_condition, condition_status, etc.
                
                // Por ahora mantener el Status como está y agregar campos adicionales
                Status: pendientes[index].Status, // Mantener el estado actual (Activo/Inactivo)
                
                // Intentar con un campo personalizado para estado físico
                physical_condition: selectStatus.value, // BUENA/DAÑADA
                
                // Campos de auditoría
                last_review_date: new Date().toISOString(),
                reviewed_by: getCurrentUser()
            };

            console.log('=== ANÁLISIS DE CAMPOS ===');
            console.log('Campo Status original:', pendientes[index].Status);
            console.log('Campo LabelStatus original:', pendientes[index].LabelStatus);
            console.log('Campo PendingStatus original:', pendientes[index].PendingStatus);
            console.log('¿Hay campo para estado físico?');
            console.log('Todos los campos del producto:', Object.keys(pendientes[index]));
            console.log('===========================');

            console.log('=== DATOS A ENVIAR AL SERVIDOR ===');
            console.log('Producto original:', pendientes[index]);
            console.log('Producto actualizado:', updatedProduct);
            console.log('Cambios realizados:');
            console.log(`  - PendingStatus: ${pendientes[index].PendingStatus} → ${updatedProduct.PendingStatus}`);
            console.log(`  - LabelStatus: ${pendientes[index].LabelStatus} → ${updatedProduct.LabelStatus}`);
            console.log(`  - Estado físico (physical_condition): → ${updatedProduct.physical_condition}`);
            console.log(`  - Observations: "${pendientes[index].observations}" → "${updatedProduct.observations}"`);
            console.log('==================================');

            // Enviar actualización (ya sabemos que funciona con IDs numéricos)
            console.log('Enviando actualización...');
            
            const response = await fetch(`${API_BASE_URL}/${updatedProduct.id_unit}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedProduct)
            });

            console.log('=== RESPUESTA DEL SERVIDOR ===');
            console.log('Status HTTP:', response.status);
            console.log('Status Text:', response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            // Manejar respuesta (204 = No Content, operación exitosa)
            const responseText = await response.text();
            console.log('Respuesta raw del servidor:', responseText || '[Respuesta vacía - OK]');
            
            const updatedResponse = { 
                success: true, 
                status: response.status,
                message: response.status === 204 ? "Actualización exitosa" : responseText 
            };

            // Actualizar array local y rerender
            pendientes.splice(index, 1); // Remover producto aprobado
            showNotification(`Producto ${updatedProduct.id_unit} aprobado exitosamente`, 'success');
            renderTabla();

        } catch (error) {
            console.error("Error al aprobar producto:", error);
            showNotification('Error al aprobar el producto. Intenta nuevamente.', 'danger');
            
            // Restaurar botón en caso de error
            const row = document.querySelector(`tr[data-index="${index}"]`);
            const approveButton = row.querySelector('button');
            approveButton.innerHTML = '<i class="fas fa-check me-1"></i> Aprobar';
            approveButton.disabled = false;
        }
    }

    // Función para obtener texto legible del estado de etiqueta
    function getLabelStatusText(labelStatus) {
        switch(labelStatus) {
            case 1: return '<span class="badge bg-success">✅ BIEN</span>';
            case 2: return '<span class="badge bg-warning text-dark">❌ NO</span>';
            case 3: return '<span class="badge bg-danger">🔧 DAÑADA</span>';
            default: return '<span class="badge bg-secondary">N/A</span>';
        }
    }

    // Función para obtener texto legible del estado pendiente
    function getPendingStatusText(pendingStatus) {
        switch(pendingStatus) {
            case 1: return '<span class="badge bg-warning text-dark"><i class="fas fa-clock me-1"></i>PENDIENTE</span>';
            case 2: return '<span class="badge bg-success"><i class="fas fa-check me-1"></i>REALIZADO</span>';
            default: return '<span class="badge bg-secondary">N/A</span>';
        }
    }
    function getCurrentUser() {
        // Aquí deberías implementar la lógica para obtener el usuario actual
        // Por ejemplo, desde localStorage, sessionStorage, o un token JWT
        return localStorage.getItem('currentUser') || 'Sistema';
    }

    // Función para aprobar todos los productos (funcionalidad adicional)
    async function aprobarTodos() {
        if (pendientes.length === 0) {
            showNotification('No hay productos pendientes para aprobar', 'info');
            return;
        }

        const confirmacion = confirm(`¿Estás seguro de aprobar todos los ${pendientes.length} productos pendientes?`);
        if (!confirmacion) return;

        showNotification('Aprobando todos los productos...', 'info');
        
        for (let i = 0; i < pendientes.length; i++) {
            await aprobarUno(i);
            // Pequeña pausa para evitar sobrecarga del servidor
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Función para iniciar nueva revisión semestral (marcar todos los productos activos como pendientes)
    async function iniciarNuevaRevision() {
        try {
            const confirmacion = confirm(
                '¿Estás seguro de iniciar una nueva revisión semestral?\n' +
                'Esto marcará todos los productos activos como "PENDIENTE" para revisión.'
            );
            
            if (!confirmacion) return;

            showNotification('Iniciando nueva revisión semestral...', 'info');

            // Obtener todos los productos activos
            const response = await fetch(`${API_BASE_URL}/available`);
            const productosActivos = await response.json();

            let productosActualizados = 0;

            for (const producto of productosActivos) {
                try {
                    const productoActualizado = {
                        ...producto,
                        PendingStatus: 1, // Marcar como pendiente
                        last_review_date: null,
                        reviewed_by: null
                    };

                    await fetch(`${API_BASE_URL}/${producto.id_unit}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(productoActualizado)
                    });

                    productosActualizados++;
                } catch (error) {
                    console.error(`Error al actualizar producto ${producto.id_unit}:`, error);
                }
            }

            showNotification(
                `Nueva revisión iniciada: ${productosActualizados} productos marcados como pendientes`, 
                'success'
            );

            // Recargar la página para mostrar los nuevos productos pendientes
            setTimeout(() => location.reload(), 2000);

        } catch (error) {
            console.error('Error al iniciar nueva revisión:', error);
            showNotification('Error al iniciar nueva revisión', 'danger');
        }
    }

    // Función para generar reporte (placeholder)
    function generarReporte() {
        showNotification('Generando reporte de revisión...', 'info');
        // Aquí implementarías la lógica para generar un reporte
        console.log('Generar reporte de revisión');
    }

    // Función de inicialización
    async function inicializar() {
        try {
            await obtenerProductosPendientes();
            renderTabla();
        } catch (error) {
            console.error('Error en la inicialización:', error);
            showNotification('Error al inicializar el sistema', 'danger');
        }
    }

    // Hacer funciones disponibles globalmente
    window.aprobarUno = aprobarUno;
    window.aprobarTodos = aprobarTodos;
    window.generarReporte = generarReporte;
    window.iniciarNuevaRevision = iniciarNuevaRevision;
    window.actualizarClaseSelect = actualizarClaseSelect;

    // Inicializar el sistema
    inicializar();
});