// Sistema de Revisión Semestral de Inventario - CORREGIDO con SweetAlert
/*
 * CORRECCIÓN IMPORTANTE:
 * - La API devuelve PendingStatus como strings: "Pendiente", "Realizado"
 * - Usar endpoints específicos para cambiar estado
 * - Filtrado corregido para strings
 * - SweetAlert para confirmaciones y alertas mejoradas
 * 
 * DEPENDENCIAS REQUERIDAS:
 * - SweetAlert2: https://cdn.jsdelivr.net/npm/sweetalert2@11
 * - Bootstrap 5 (para estilos)
 * - Font Awesome (para iconos)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('#pendientesTable tbody');
    const API_BASE_URL = "https://healtyapi.bsite.net/api/product_units";
    
    let pendientes = []; // Array global para manejar los productos pendientes

    // Función para obtener usuario actual (placeholder)
    function getCurrentUser() {
        return localStorage.getItem('currentUser') || 'Sistema';
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // FUNCIÓN CORREGIDA: Filtrar productos pendientes
    async function obtenerProductosPendientes() {
        try {
            showNotification('Cargando productos pendientes...', 'info');
            
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // FILTRADO: Buscar productos con PendingStatus = "Pendiente"
            pendientes = data.filter(item => {
                const isPendiente = item.PendingStatus === "Pendiente";
                const isActive = item.Status !== "Deshabilitado" && item.Status !== "Inactivo";
                return isPendiente && isActive;
            });

            showNotification(`Se encontraron ${pendientes.length} productos pendientes`, 'success');
            return pendientes;
            
        } catch (error) {
            showNotification('Error al cargar los productos. Verifica tu conexión.', 'danger');
            return [];
        }
    }

    // Función para renderizar la tabla
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
        });

        agregarContadorPendientes();
        agregarBotonAprobarTodos();
    }

    // Función para agregar botón "Aprobar Todos" después del contador
    function agregarBotonAprobarTodos() {
        const existingButton = document.getElementById('aprobar-todos-row');
        if (existingButton) existingButton.remove();
        
        if (pendientes.length > 0) {
            const buttonRow = document.createElement('tr');
            buttonRow.id = 'aprobar-todos-row';
            buttonRow.innerHTML = `
                <td colspan="9" class="bg-light text-center py-3 border-top">
                    <button class="btn btn-success btn-lg shadow" onclick="aprobarTodos()" title="Aprobar todos los productos pendientes">
                        <i class="fas fa-check-double me-2"></i>
                        Aprobar Todos los Productos (${pendientes.length})
                    </button>
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Esto aprobará todos los productos que tengan los campos completos
                        </small>
                    </div>
                </td>
            `;
            tbody.appendChild(buttonRow);
        }
    }



    // Crear select de etiqueta
    function createLabelSelect(currentLabelStatus, index) {
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

    // FUNCIÓN: Usar endpoint específico para aprobar
    async function aprobarUno(index) {
        try {
            const row = document.querySelector(`tr[data-index="${index}"]`);
            const selectLabel = document.getElementById(`label-${index}`);
            const textareaObs = document.getElementById(`obs-${index}`);

            // Validar campos requeridos
            if (!selectLabel.value) {
                showNotification('Por favor completa el estado de la etiqueta', 'warning');
                return;
            }

            // Mostrar indicador de carga
            const approveButton = row.querySelector('button');
            const originalContent = approveButton.innerHTML;
            approveButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Aprobando...';
            approveButton.disabled = true;

            const productId = pendientes[index].id_unit;

            // PASO 1: Usar endpoint específico para cambiar estado a "Realizado"
            const statusResponse = await fetch(`${API_BASE_URL}/set-pending-to-done/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!statusResponse.ok) {
                throw new Error(`Error al cambiar estado: ${statusResponse.status}`);
            }

            // PASO 2: Actualizar otros campos (LabelStatus, observations, etc.)
            const updatedProduct = {
                ...pendientes[index],
                PendingStatus: "Realizado",
                LabelStatus: parseInt(selectLabel.value),
                observations: textareaObs.value.trim() || null,
                last_review_date: new Date().toISOString(),
                reviewed_by: getCurrentUser()
            };

            const updateResponse = await fetch(`${API_BASE_URL}/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedProduct)
            });

            if (!updateResponse.ok) {
                // Si falla la actualización de campos, revertir el estado
                await fetch(`${API_BASE_URL}/set-done-to-pending/${productId}`, {
                    method: "PUT"
                });
                throw new Error(`Error al actualizar campos: ${updateResponse.status}`);
            }

            // Remover de la lista local y rerender
            pendientes.splice(index, 1);
            showNotification(`Producto ${productId} aprobado exitosamente`, 'success');
            renderTabla();

        } catch (error) {
            showNotification('Error al aprobar el producto. Intenta nuevamente.', 'danger');
            
            // Restaurar botón
            const row = document.querySelector(`tr[data-index="${index}"]`);
            if (row) {
                const approveButton = row.querySelector('button');
                approveButton.innerHTML = '<i class="fas fa-check me-1"></i> Aprobar';
                approveButton.disabled = false;
            }
        }
    }

    // Función para iniciar nueva revisión usando endpoint específico con SweetAlert
    async function iniciarNuevaRevision() {
        try {
            const confirmacion = await Swal.fire({
                icon: 'warning',
                title: '¿Iniciar nueva revisión semestral?',
                html: `
                    <div class="text-start">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>¡Atención!</strong> Esta acción marcará todos los productos realizados como <strong>"PENDIENTE"</strong> para una nueva revisión.
                        </div>
                        <p><strong>Esto significa que:</strong></p>
                        <ul class="text-start ps-3">
                            <li>Todos los productos con estado "Realizado" volverán a "Pendiente"</li>
                            <li>Tendrás que revisar nuevamente todos los productos</li>
                            <li>Se iniciará un nuevo ciclo de revisión semestral</li>
                        </ul>
                        <p><strong>¿Estás seguro de continuar?</strong></p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-refresh me-1"></i> Sí, iniciar revisión',
                cancelButtonText: '<i class="fas fa-times me-1"></i> Cancelar',
                confirmButtonColor: '#f39c12',
                cancelButtonColor: '#6c757d',
                focusCancel: true,
                reverseButtons: true
            });
            
            if (!confirmacion.isConfirmed) return;

            // Mostrar loading
            Swal.fire({
                title: 'Iniciando nueva revisión...',
                html: `
                    <div class="text-center">
                        <div class="mb-3">
                            <div class="spinner-border text-warning" role="status">
                                <span class="visually-hidden">Procesando...</span>
                            </div>
                        </div>
                        <p id="revision-progress">Obteniendo productos...</p>
                    </div>
                `,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false
            });

            // Obtener todos los productos
            document.getElementById('revision-progress').textContent = 'Obteniendo lista de productos...';
            const response = await fetch(API_BASE_URL);
            const todosLosProductos = await response.json();

            // Filtrar productos que están "Realizado" y activos
            const productosRealizados = todosLosProductos.filter(p => 
                p.PendingStatus === "Realizado" && 
                p.Status !== "Deshabilitado" && 
                p.Status !== "Inactivo"
            );

            if (productosRealizados.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin productos para revisar',
                    text: 'No se encontraron productos realizados para marcar como pendientes.',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            let productosActualizados = 0;
            const totalProductos = productosRealizados.length;

            // Usar el endpoint específico para cada producto
            for (let i = 0; i < productosRealizados.length; i++) {
                const producto = productosRealizados[i];
                
                document.getElementById('revision-progress').textContent = 
                    `Procesando producto ${producto.id_unit} (${i + 1}/${totalProductos})`;

                try {
                    const response = await fetch(`${API_BASE_URL}/set-done-to-pending/${producto.id_unit}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    if (response.ok) {
                        productosActualizados++;
                    }
                } catch (error) {
                    // Error silencioso para no interrumpir el proceso
                }
            }

            // Mostrar resultado
            Swal.fire({
                icon: 'success',
                title: '¡Nueva revisión iniciada!',
                html: `
                    <div class="text-center">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Se marcaron <strong>${productosActualizados}</strong> productos como pendientes
                        </div>
                        <p>La nueva revisión semestral ha comenzado.</p>
                        <small class="text-muted">La página se recargará para mostrar los productos pendientes.</small>
                    </div>
                `,
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar revisión',
                text: 'Ocurrió un error al intentar iniciar la nueva revisión. Verifica tu conexión.',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#dc3545'
            });
        }
    }

    // Función para aprobar todos los productos con SweetAlert
    async function aprobarTodos() {
        if (pendientes.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin productos pendientes',
                text: 'No hay productos pendientes para aprobar',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Verificar que todos los productos tengan campos completos
        const productosIncompletos = [];
        pendientes.forEach((producto, index) => {
            const selectLabel = document.getElementById(`label-${index}`);
            
            if (!selectLabel?.value) {
                productosIncompletos.push(producto.id_unit);
            }
        });

        if (productosIncompletos.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                html: `
                    <p>Los siguientes productos tienen campos sin completar:</p>
                    <div class="alert alert-warning mt-2">
                        <strong>Productos:</strong> ${productosIncompletos.join(', ')}
                    </div>
                    <p>Por favor, completa el <strong>estado de la etiqueta</strong> para todos los productos antes de continuar.</p>
                `,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f39c12'
            });
            return;
        }

        // Mostrar confirmación con detalles
        const result = await Swal.fire({
            icon: 'question',
            title: '¿Aprobar todos los productos?',
            html: `
                <div class="text-start">
                    <p><strong>Estás a punto de aprobar ${pendientes.length} productos:</strong></p>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Esto marcará todos los productos como <strong>"Realizado"</strong> y los removerá de la lista de pendientes.
                    </div>
                    <p><strong>¿Estás seguro de continuar?</strong></p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: `<i class="fas fa-check me-1"></i> Sí, aprobar todos`,
            cancelButtonText: `<i class="fas fa-times me-1"></i> Cancelar`,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            focusCancel: true,
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        // Mostrar progress con SweetAlert
        Swal.fire({
            title: 'Aprobando productos...',
            html: `
                <div class="text-center">
                    <div class="mb-3">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Procesando...</span>
                        </div>
                    </div>
                    <p id="progress-text">Iniciando proceso...</p>
                    <div class="progress mt-3">
                        <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                             style="width: 0%"></div>
                    </div>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.getHtmlContainer().style.padding = '20px';
            }
        });

        try {
            // Crear copia del array porque aprobarUno() modifica el array original
            const productosParaAprobar = [...pendientes];
            const totalProductos = productosParaAprobar.length;
            let productosAprobados = 0;
            let errores = [];

            for (let i = 0; i < productosParaAprobar.length; i++) {
                const producto = productosParaAprobar[i];
                
                // Actualizar progress
                const progreso = Math.round(((i + 1) / totalProductos) * 100);
                document.getElementById('progress-text').textContent = 
                    `Aprobando producto ${producto.id_unit} (${i + 1}/${totalProductos})`;
                document.getElementById('progress-bar').style.width = `${progreso}%`;

                try {
                    // Como aprobarUno() remueve elementos, siempre aprobar el índice 0
                    await aprobarUno(0);
                    productosAprobados++;
                    
                    // Pequeña pausa para evitar sobrecarga y mostrar progreso
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    errores.push({
                        id: producto.id_unit,
                        error: error.message
                    });
                }
            }

            // Cerrar progress y mostrar resultado
            Swal.close();

            if (errores.length === 0) {
                // Todos los productos se aprobaron exitosamente
                Swal.fire({
                    icon: 'success',
                    title: '¡Aprobación completada!',
                    html: `
                        <div class="text-center">
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle me-2"></i>
                                Se aprobaron <strong>${productosAprobados}</strong> productos exitosamente
                            </div>
                            <p>Todos los productos han sido marcados como <strong>"Realizado"</strong></p>
                        </div>
                    `,
                    confirmButtonText: 'Excelente',
                    confirmButtonColor: '#28a745'
                });
            } else if (productosAprobados > 0) {
                // Algunos productos se aprobaron, otros tuvieron errores
                Swal.fire({
                    icon: 'warning',
                    title: 'Aprobación parcial',
                    html: `
                        <div class="text-start">
                            <div class="alert alert-success mb-2">
                                <i class="fas fa-check me-2"></i>
                                <strong>${productosAprobados}</strong> productos aprobados exitosamente
                            </div>
                            <div class="alert alert-danger mb-2">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>${errores.length}</strong> productos con errores
                            </div>
                            <details class="mt-3">
                                <summary class="btn btn-sm btn-outline-danger">Ver errores</summary>
                                <div class="mt-2">
                                    ${errores.map(e => `
                                        <div class="small text-muted mb-1">
                                            <strong>Producto ${e.id}:</strong> ${e.error}
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                        </div>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#f39c12'
                });
            } else {
                // Todos los productos fallaron
                Swal.fire({
                    icon: 'error',
                    title: 'Error en la aprobación',
                    html: `
                        <div class="alert alert-danger">
                            <i class="fas fa-times-circle me-2"></i>
                            No se pudo aprobar ningún producto
                        </div>
                        <p>Revisa la conexión a internet y vuelve a intentar.</p>
                    `,
                    confirmButtonText: 'Reintentar',
                    confirmButtonColor: '#dc3545'
                });
            }

        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: `Ocurrió un error durante el proceso: ${error.message}`,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
            });
        }
    }

    // Funciones auxiliares que faltaban
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
                        <button class="btn btn-outline-warning" onclick="iniciarNuevaRevisionConfirm()">
                            <i class="fas fa-refresh me-1"></i> Nueva Revisión
                        </button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trMensaje);
    }

    // Wrapper para iniciar nueva revisión con confirmación desde mensaje final
    async function iniciarNuevaRevisionConfirm() {
        await iniciarNuevaRevision();
    }

    function getNextReviewDate() {
        const now = new Date();
        const currentMonth = now.getMonth();
        let nextReview;
        
        if (currentMonth < 5) {
            nextReview = new Date(now.getFullYear(), 5, 1);
        } else if (currentMonth < 11) {
            nextReview = new Date(now.getFullYear(), 11, 1);
        } else {
            nextReview = new Date(now.getFullYear() + 1, 5, 1);
        }
        
        return nextReview.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

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

    function actualizarClaseSelect(select) {
        // Esta función ya no es necesaria sin el select de estado físico
        // Se mantiene para compatibilidad si se necesita en el futuro
    }

    function generarReporte() {
        showNotification('Generando reporte de revisión...', 'info');
        // Aquí implementarías la lógica para generar un reporte
    }

    // Función de inicialización
    async function inicializar() {
        try {
            await obtenerProductosPendientes();
            renderTabla();
        } catch (error) {
            showNotification('Error al inicializar el sistema', 'danger');
        }
    }

    // Hacer funciones disponibles globalmente
    window.aprobarUno = aprobarUno;
    window.aprobarTodos = aprobarTodos;
    window.generarReporte = generarReporte;
    window.iniciarNuevaRevision = iniciarNuevaRevision;
    window.iniciarNuevaRevisionConfirm = iniciarNuevaRevisionConfirm;
    window.actualizarClaseSelect = actualizarClaseSelect;

    // Inicializar el sistema
    inicializar();
});