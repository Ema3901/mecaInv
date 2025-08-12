// Sistema de Revisión Semestral de Inventario - Versión Mejorada
/*
 * CARACTERÍSTICAS MEJORADAS:
 * - Diseño moderno y responsivo
 * - Progress tracking con estadísticas
 * - SweetAlert2 para mejor UX
 * - Manejo robusto de errores
 * - Operaciones asíncronas optimizadas
 * - Generación de reportes
 * - Sistema de selección múltiple
 */

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('#pendientesTable tbody');
    const API_BASE_URL = "https://healtyapi.bsite.net/api/product_units";
    
    let pendientes = [];
    let selectedProducts = new Set();
    let stats = {
        totalPendientes: 0,
        totalAprobados: 0,
        tiempoInicio: null
    };

    // ==================== INICIALIZACIÓN ====================
    async function inicializar() {
        try {
            mostrarLoading(true);
            stats.tiempoInicio = new Date();
            
            await obtenerProductosPendientes();
            renderTabla();
            actualizarStats();
            
            mostrarLoading(false);
            mostrarTableContainer(true);
            
        } catch (error) {
            mostrarError('Error al inicializar el sistema', error);
            mostrarLoading(false);
        }
    }

    // ==================== API CALLS ====================
    async function obtenerProductosPendientes() {
        try {
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            pendientes = data.filter(item => {
                const isPendiente = item.PendingStatus === "Pendiente";
                const isActive = item.Status !== "Deshabilitado" && item.Status !== "Inactivo";
                return isPendiente && isActive;
            });

            stats.totalPendientes = pendientes.length;
            
            mostrarNotificacion(
                `Se encontraron ${pendientes.length} productos pendientes`, 
                'success'
            );
            
            return pendientes;
            
        } catch (error) {
            throw new Error(`Error al cargar productos: ${error.message}`);
        }
    }

    // ==================== RENDER FUNCTIONS ====================
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
            tr.className = 'producto-row';

            const isSelected = selectedProducts.has(item.id_unit);
            if (isSelected) tr.classList.add('selected');

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="form-check-input producto-checkbox" 
                           value="${item.id_unit}" 
                           ${isSelected ? 'checked' : ''}
                           onchange="toggleProductSelection(${item.id_unit})">
                </td>
                <td>
                    <span class="product-id">${item.id_unit}</span>
                </td>
                <td>
                    <div class="product-info">
                        <strong>${item.ProductInfo?.name || 'N/A'}</strong>
                        <small class="text-muted d-block">${item.ProductInfo?.description || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${item.ProductInfo?.model || 'N/A'}</span>
                </td>
                <td>
                    <div class="location-info">
                        <i class="fas fa-map-marker-alt text-muted me-1"></i>
                        ${item.LocationInfo?.location_name || 'N/A'}
                    </div>
                </td>
                <td>
                    <div class="lab-info">
                        <i class="fas fa-flask text-info me-1"></i>
                        ${item.LabInfo?.lab_name || 'N/A'}
                    </div>
                </td>
                <td>
                    <span class="badge bg-warning text-dark status-badge">
                        <i class="fas fa-clock me-1"></i>
                        PENDIENTE
                    </span>
                </td>
                <td class="revision-column">
                    ${createRevisionControls(item, index)}
                </td>
                <td class="action-column">
                    <button class="btn btn-success btn-sm action-btn" 
                            onclick="aprobarProducto(${index})" 
                            title="Aprobar revisión">
                        <i class="fas fa-check me-1"></i>
                        Aprobar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        agregarFilaAcciones();
    }

    function createRevisionControls(item, index) {
        let selectedValue = item.LabelStatus || 1;
        if (typeof item.LabelStatus === 'string') {
            switch(item.LabelStatus.toLowerCase()) {
                case 'bien': selectedValue = 1; break;
                case 'no': selectedValue = 2; break;
                case 'dañada': selectedValue = 3; break;
                default: selectedValue = parseInt(item.LabelStatus) || 1;
            }
        }
        
        return `
            <div class="revision-controls">
                <div class="mb-2">
                    <label class="form-label small">Estado de Etiqueta:</label>
                    <select class="form-select form-select-sm label-select" id="label-${index}">
                        <option value="1" ${selectedValue == 1 ? "selected" : ""}>
                            ✅ BIEN
                        </option>
                        <option value="2" ${selectedValue == 2 ? "selected" : ""}>
                            ❌ NO TIENE
                        </option>
                        <option value="3" ${selectedValue == 3 ? "selected" : ""}>
                            🔧 DAÑADA
                        </option>
                    </select>
                </div>
                <div>
                    <label class="form-label small">Observaciones:</label>
                    <textarea class="form-control form-control-sm observation-textarea" 
                              id="obs-${index}" 
                              rows="2" 
                              placeholder="Escribe observaciones aquí..."
                              maxlength="500">${item.observations || ''}</textarea>
                    <small class="text-muted">Máx. 500 caracteres</small>
                </div>
            </div>
        `;
    }

    function agregarFilaAcciones() {
        if (pendientes.length === 0) return;

        const actionRow = document.createElement('tr');
        actionRow.className = 'action-row';
        actionRow.innerHTML = `
            <td colspan="9" class="action-row-content">
                <div class="bulk-actions">
                    <div class="bulk-info">
                        <i class="fas fa-info-circle text-primary me-2"></i>
                        <span>${pendientes.length} productos pendientes de revisión</span>
                    </div>
                    <div class="bulk-buttons">
                        <button class="btn btn-outline-primary btn-sm" onclick="aprobarSeleccionados()" id="aprobarSeleccionadosBtn" disabled>
                            <i class="fas fa-check me-1"></i>
                            Aprobar Seleccionados (<span id="selectedCount">0</span>)
                        </button>
                        <button class="btn btn-success btn-sm" onclick="aprobarTodos()">
                            <i class="fas fa-check-double me-1"></i>
                            Aprobar Todos (${pendientes.length})
                        </button>
                    </div>
                </div>
            </td>
        `;
        
        tbody.appendChild(actionRow);
    }

    // ==================== PRODUCT ACTIONS ====================
    async function aprobarProducto(index) {
        try {
            const row = document.querySelector(`tr[data-index="${index}"]`);
            const selectLabel = document.getElementById(`label-${index}`);
            const textareaObs = document.getElementById(`obs-${index}`);

            // Validar campos requeridos
            if (!selectLabel.value) {
                mostrarAdvertencia('Por favor completa el estado de la etiqueta');
                return;
            }

            // Mostrar indicador de carga en el botón
            const approveButton = row.querySelector('.action-btn');
            const originalContent = approveButton.innerHTML;
            approveButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Aprobando...';
            approveButton.disabled = true;

            const productId = pendientes[index].id_unit;

            // Paso 1: Cambiar estado a "Realizado"
            const statusResponse = await fetch(`${API_BASE_URL}/set-pending-to-done/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            if (!statusResponse.ok) {
                throw new Error(`Error al cambiar estado: ${statusResponse.status}`);
            }

            // Paso 2: Actualizar otros campos
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct)
            });

            if (!updateResponse.ok) {
                // Revertir el estado si falla
                await fetch(`${API_BASE_URL}/set-done-to-pending/${productId}`, {
                    method: "PUT"
                });
                throw new Error(`Error al actualizar campos: ${updateResponse.status}`);
            }

            // Remover de la lista y actualizar
            pendientes.splice(index, 1);
            stats.totalAprobados++;
            selectedProducts.delete(productId);
            
            mostrarNotificacion(`Producto ${productId} aprobado exitosamente`, 'success');
            
            // Efecto de eliminación suave
            row.style.opacity = '0.5';
            row.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                renderTabla();
                actualizarStats();
            }, 300);

        } catch (error) {
            mostrarError('Error al aprobar el producto', error);
            
            // Restaurar botón
            const row = document.querySelector(`tr[data-index="${index}"]`);
            if (row) {
                const approveButton = row.querySelector('.action-btn');
                approveButton.innerHTML = '<i class="fas fa-check me-1"></i> Aprobar';
                approveButton.disabled = false;
            }
        }
    }

    async function aprobarTodos() {
        if (pendientes.length === 0) {
            mostrarInfo('No hay productos pendientes para aprobar');
            return;
        }

        // Verificar campos completos
        const productosIncompletos = validarCamposCompletos();
        
        if (productosIncompletos.length > 0) {
            mostrarAdvertencia(
                `Completa los campos requeridos para los productos: ${productosIncompletos.join(', ')}`
            );
            return;
        }

        // Confirmar acción
        const result = await Swal.fire({
            icon: 'question',
            title: '¿Aprobar todos los productos?',
            html: `
                <div class="text-start">
                    <p><strong>Estás a punto de aprobar ${pendientes.length} productos:</strong></p>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Esto marcará todos los productos como <strong>"Realizado"</strong>
                    </div>
                    <p><strong>¿Estás seguro de continuar?</strong></p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: `<i class="fas fa-check me-1"></i> Sí, aprobar todos`,
            cancelButtonText: `<i class="fas fa-times me-1"></i> Cancelar`,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545'
        });

        if (!result.isConfirmed) return;

        await procesarAprobacionMasiva([...pendientes]);
    }

    async function aprobarSeleccionados() {
        if (selectedProducts.size === 0) {
            mostrarInfo('No hay productos seleccionados');
            return;
        }

        const productosSeleccionados = pendientes.filter(p => selectedProducts.has(p.id_unit));
        
        // Verificar campos completos para productos seleccionados
        const productosIncompletos = [];
        productosSeleccionados.forEach((producto) => {
            const index = pendientes.findIndex(p => p.id_unit === producto.id_unit);
            const selectLabel = document.getElementById(`label-${index}`);
            
            if (!selectLabel?.value) {
                productosIncompletos.push(producto.id_unit);
            }
        });

        if (productosIncompletos.length > 0) {
            mostrarAdvertencia(
                `Completa los campos requeridos para los productos: ${productosIncompletos.join(', ')}`
            );
            return;
        }

        const result = await Swal.fire({
            icon: 'question',
            title: `¿Aprobar ${selectedProducts.size} productos seleccionados?`,
            showCancelButton: true,
            confirmButtonText: `Aprobar Seleccionados`,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745'
        });

        if (!result.isConfirmed) return;

        await procesarAprobacionMasiva(productosSeleccionados);
    }

    // ==================== BULK OPERATIONS ====================
    async function procesarAprobacionMasiva(productos) {
        mostrarProgress(true, 'Aprobando productos...');

        try {
            const total = productos.length;
            let aprobados = 0;
            let errores = [];

            for (let i = 0; i < productos.length; i++) {
                const producto = productos[i];
                const progreso = Math.round(((i + 1) / total) * 100);
                
                actualizarProgress(
                    progreso,
                    `Aprobando producto ${producto.id_unit} (${i + 1}/${total})`,
                    `${progreso}%`
                );

                try {
                    const index = pendientes.findIndex(p => p.id_unit === producto.id_unit);
                    if (index !== -1) {
                        await aprobarProductoSilencioso(index);
                        aprobados++;
                    }
                } catch (error) {
                    errores.push({
                        id: producto.id_unit,
                        error: error.message
                    });
                }

                // Pausa para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            mostrarProgress(false);
            mostrarResultadoAprobacion(aprobados, errores);
            
            renderTabla();
            actualizarStats();

        } catch (error) {
            mostrarProgress(false);
            mostrarError('Error en la aprobación masiva', error);
        }
    }

    async function aprobarProductoSilencioso(index) {
        const selectLabel = document.getElementById(`label-${index}`);
        const textareaObs = document.getElementById(`obs-${index}`);
        const productId = pendientes[index].id_unit;

        // Cambiar estado
        const statusResponse = await fetch(`${API_BASE_URL}/set-pending-to-done/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });

        if (!statusResponse.ok) {
            throw new Error(`Error al cambiar estado: ${statusResponse.status}`);
        }

        // Actualizar campos
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProduct)
        });

        if (!updateResponse.ok) {
            await fetch(`${API_BASE_URL}/set-done-to-pending/${productId}`, {
                method: "PUT"
            });
            throw new Error(`Error al actualizar campos: ${updateResponse.status}`);
        }

        // Remover de arrays
        selectedProducts.delete(productId);
        stats.totalAprobados++;
    }

    // ==================== NUEVA REVISIÓN ====================
    async function iniciarNuevaRevision() {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Iniciar nueva revisión semestral?',
            html: `
                <div class="text-start">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>¡Atención!</strong> Esta acción marcará todos los productos realizados como <strong>"PENDIENTE"</strong>
                    </div>
                    <p><strong>Esto significa que:</strong></p>
                    <ul class="text-start ps-3">
                        <li>Todos los productos con estado "Realizado" volverán a "Pendiente"</li>
                        <li>Se iniciará un nuevo ciclo de revisión semestral</li>
                        <li>Tendrás que revisar nuevamente todos los productos</li>
                    </ul>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-refresh me-1"></i> Iniciar Revisión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#f39c12'
        });
        
        if (!confirmacion.isConfirmed) return;

        mostrarProgress(true, 'Iniciando nueva revisión...');

        try {
            actualizarProgress(20, 'Obteniendo productos realizados...', '20%');
            
            const response = await fetch(API_BASE_URL);
            const todosLosProductos = await response.json();

            const productosRealizados = todosLosProductos.filter(p => 
                p.PendingStatus === "Realizado" && 
                p.Status !== "Deshabilitado" && 
                p.Status !== "Inactivo"
            );

            if (productosRealizados.length === 0) {
                mostrarProgress(false);
                mostrarInfo('No se encontraron productos realizados para marcar como pendientes');
                return;
            }

            actualizarProgress(40, `Procesando ${productosRealizados.length} productos...`, '40%');

            let productosActualizados = 0;
            const total = productosRealizados.length;

            for (let i = 0; i < productosRealizados.length; i++) {
                const producto = productosRealizados[i];
                const progreso = 40 + Math.round((i / total) * 50);
                
                actualizarProgress(
                    progreso,
                    `Procesando producto ${producto.id_unit} (${i + 1}/${total})`,
                    `${progreso}%`
                );

                try {
                    const response = await fetch(`${API_BASE_URL}/set-done-to-pending/${producto.id_unit}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" }
                    });

                    if (response.ok) {
                        productosActualizados++;
                    }
                } catch (error) {
                    console.error(`Error processing product ${producto.id_unit}:`, error);
                }
            }

            mostrarProgress(false);

            await Swal.fire({
                icon: 'success',
                title: '¡Nueva revisión iniciada!',
                html: `
                    <div class="text-center">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Se marcaron <strong>${productosActualizados}</strong> productos como pendientes
                        </div>
                        <p>La nueva revisión semestral ha comenzado.</p>
                    </div>
                `,
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#28a745'
            });

            // Recargar la página para mostrar los nuevos pendientes
            location.reload();

        } catch (error) {
            mostrarProgress(false);
            mostrarError('Error al iniciar revisión', error);
        }
    }

    // ==================== GENERAR REPORTE ====================
    async function generarReporte() {
        try {
            mostrarNotificacion('Generando reporte...', 'info');

            // Obtener datos completos para el reporte
            const response = await fetch(API_BASE_URL);
            const todosLosProductos = await response.json();
            
            const productosRealizados = todosLosProductos.filter(p => 
                p.PendingStatus === "Realizado" && 
                p.Status !== "Deshabilitado" && 
                p.Status !== "Inactivo"
            );

            const productosPendientes = todosLosProductos.filter(p => 
                p.PendingStatus === "Pendiente" && 
                p.Status !== "Deshabilitado" && 
                p.Status !== "Inactivo"
            );

            // Crear datos del reporte
            const reporteData = {
                fecha: new Date().toLocaleDateString('es-ES'),
                resumen: {
                    totalProductos: todosLosProductos.length,
                    realizados: productosRealizados.length,
                    pendientes: productosPendientes.length,
                    porcentajeCompletado: Math.round((productosRealizados.length / (productosRealizados.length + productosPendientes.length)) * 100) || 0
                },
                productosRealizados,
                productosPendientes
            };

            // Generar y descargar reporte Excel
            await generarReporteExcel(reporteData);

        } catch (error) {
            mostrarError('Error al generar reporte', error);
        }
    }

    async function generarReporteExcel(data) {
        // Crear workbook
        const wb = {
            SheetNames: ['Resumen', 'Productos Realizados', 'Productos Pendientes'],
            Sheets: {}
        };

        // Hoja de Resumen
        const resumenData = [
            ['REPORTE DE REVISIÓN SEMESTRAL DE INVENTARIO'],
            ['Fecha de generación:', data.fecha],
            [''],
            ['RESUMEN GENERAL'],
            ['Total de productos:', data.resumen.totalProductos],
            ['Productos realizados:', data.resumen.realizados],
            ['Productos pendientes:', data.resumen.pendientes],
            ['Porcentaje completado:', data.resumen.porcentajeCompletado + '%'],
            [''],
            ['ESTADÍSTICAS POR ESTADO DE ETIQUETA'],
            ['Etiquetas en buen estado:', data.productosRealizados.filter(p => p.LabelStatus == 1).length],
            ['Sin etiqueta:', data.productosRealizados.filter(p => p.LabelStatus == 2).length],
            ['Etiquetas dañadas:', data.productosRealizados.filter(p => p.LabelStatus == 3).length]
        ];

        wb.Sheets['Resumen'] = crearHojaExcel(resumenData);

        // Hoja de Productos Realizados
        const realizadosHeaders = ['ID', 'Producto', 'Modelo', 'Ubicación', 'Laboratorio', 'Estado Etiqueta', 'Observaciones', 'Fecha Revisión', 'Revisado Por'];
        const realizadosData = [realizadosHeaders, ...data.productosRealizados.map(p => [
            p.id_unit,
            p.ProductInfo?.name || 'N/A',
            p.ProductInfo?.model || 'N/A',
            p.LocationInfo?.location_name || 'N/A',
            p.LabInfo?.lab_name || 'N/A',
            p.LabelStatus == 1 ? 'BIEN' : p.LabelStatus == 2 ? 'NO TIENE' : 'DAÑADA',
            p.observations || '',
            p.last_review_date ? new Date(p.last_review_date).toLocaleDateString('es-ES') : '',
            p.reviewed_by || ''
        ])];

        wb.Sheets['Productos Realizados'] = crearHojaExcel(realizadosData);

        // Hoja de Productos Pendientes
        const pendientesHeaders = ['ID', 'Producto', 'Modelo', 'Ubicación', 'Laboratorio', 'Estado'];
        const pendientesDataArray = [pendientesHeaders, ...data.productosPendientes.map(p => [
            p.id_unit,
            p.ProductInfo?.name || 'N/A',
            p.ProductInfo?.model || 'N/A',
            p.LocationInfo?.location_name || 'N/A',
            p.LabInfo?.lab_name || 'N/A',
            'PENDIENTE'
        ])];

        wb.Sheets['Productos Pendientes'] = crearHojaExcel(pendientesDataArray);

        // Simular descarga (en un entorno real usarías una librería como XLSX)
        const reporteTexto = generarReporteTexto(data);
        descargarArchivoTexto(reporteTexto, `Reporte_Inventario_${data.fecha.replace(/\//g, '-')}.txt`);

        mostrarNotificacion('Reporte generado exitosamente', 'success');
    }

    function crearHojaExcel(data) {
        // Simulación de creación de hoja Excel
        // En producción usarías XLSX.utils.aoa_to_sheet(data)
        return { data };
    }

    function generarReporteTexto(data) {
        return `
REPORTE DE REVISIÓN SEMESTRAL DE INVENTARIO
=========================================

Fecha de generación: ${data.fecha}

RESUMEN GENERAL
---------------
Total de productos: ${data.resumen.totalProductos}
Productos realizados: ${data.resumen.realizados}
Productos pendientes: ${data.resumen.pendientes}
Porcentaje completado: ${data.resumen.porcentajeCompletado}%

ESTADÍSTICAS POR ESTADO DE ETIQUETA
----------------------------------
Etiquetas en buen estado: ${data.productosRealizados.filter(p => p.LabelStatus == 1).length}
Sin etiqueta: ${data.productosRealizados.filter(p => p.LabelStatus == 2).length}
Etiquetas dañadas: ${data.productosRealizados.filter(p => p.LabelStatus == 3).length}

PRODUCTOS REALIZADOS (${data.productosRealizados.length})
${'='.repeat(50)}
${data.productosRealizados.map(p => 
    `ID: ${p.id_unit} | ${p.ProductInfo?.name || 'N/A'} | Estado: ${p.LabelStatus == 1 ? 'BIEN' : p.LabelStatus == 2 ? 'NO TIENE' : 'DAÑADA'} | Observaciones: ${p.observations || 'Sin observaciones'}`
).join('\n')}

PRODUCTOS PENDIENTES (${data.productosPendientes.length})
${'='.repeat(50)}
${data.productosPendientes.map(p => 
    `ID: ${p.id_unit} | ${p.ProductInfo?.name || 'N/A'} | Ubicación: ${p.LocationInfo?.location_name || 'N/A'}`
).join('\n')}
        `.trim();
    }

    function descargarArchivoTexto(contenido, nombreArchivo) {
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // ==================== SELECTION MANAGEMENT ====================
    function toggleProductSelection(productId) {
        if (selectedProducts.has(productId)) {
            selectedProducts.delete(productId);
        } else {
            selectedProducts.add(productId);
        }
        
        actualizarSeleccionVisual();
        actualizarBotonesSeleccion();
    }

    function toggleSelectAll() {
        const masterCheckbox = document.getElementById('masterCheckbox');
        const checkboxes = document.querySelectorAll('.producto-checkbox');
        
        if (masterCheckbox.checked) {
            // Seleccionar todos
            pendientes.forEach(p => selectedProducts.add(p.id_unit));
            checkboxes.forEach(cb => cb.checked = true);
        } else {
            // Deseleccionar todos
            selectedProducts.clear();
            checkboxes.forEach(cb => cb.checked = false);
        }
        
        actualizarSeleccionVisual();
        actualizarBotonesSeleccion();
    }

    function actualizarSeleccionVisual() {
        const rows = document.querySelectorAll('.producto-row');
        rows.forEach(row => {
            const productId = parseInt(row.getAttribute('data-id'));
            const checkbox = row.querySelector('.producto-checkbox');
            
            if (selectedProducts.has(productId)) {
                row.classList.add('selected');
                checkbox.checked = true;
            } else {
                row.classList.remove('selected');
                checkbox.checked = false;
            }
        });

        // Actualizar master checkbox
        const masterCheckbox = document.getElementById('masterCheckbox');
        if (masterCheckbox) {
            const totalProductos = pendientes.length;
            const productosSeleccionados = selectedProducts.size;
            
            masterCheckbox.indeterminate = productosSeleccionados > 0 && productosSeleccionados < totalProductos;
            masterCheckbox.checked = productosSeleccionados === totalProductos && totalProductos > 0;
        }
    }

    function actualizarBotonesSeleccion() {
        const selectedCount = selectedProducts.size;
        const selectedCountSpan = document.getElementById('selectedCount');
        const aprobarSeleccionadosBtn = document.getElementById('aprobarSeleccionadosBtn');
        const selectAllBtn = document.getElementById('selectAllBtn');

        if (selectedCountSpan) {
            selectedCountSpan.textContent = selectedCount;
        }

        if (aprobarSeleccionadosBtn) {
            aprobarSeleccionadosBtn.disabled = selectedCount === 0;
            aprobarSeleccionadosBtn.innerHTML = `
                <i class="fas fa-check me-1"></i>
                Aprobar Seleccionados (${selectedCount})
            `;
        }

        if (selectAllBtn) {
            selectAllBtn.innerHTML = selectedCount === pendientes.length 
                ? '<i class="fas fa-square me-1"></i> Deseleccionar Todos'
                : '<i class="fas fa-check-square me-1"></i> Seleccionar Todos';
        }
    }

    // ==================== UI HELPERS ====================
    function mostrarLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    function mostrarTableContainer(show) {
        const tableContainer = document.getElementById('tablaPendientes');
        if (tableContainer) {
            tableContainer.style.display = show ? 'block' : 'none';
        }
    }

    function mostrarProgress(show, title = '') {
        const progressContainer = document.getElementById('progressContainer');
        const progressTitle = document.getElementById('progressTitle');
        
        if (progressContainer) {
            progressContainer.style.display = show ? 'block' : 'none';
        }
        
        if (progressTitle && title) {
            progressTitle.textContent = title;
        }
    }

    function actualizarProgress(percent, text, percentText) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = text;
        if (progressPercent) progressPercent.textContent = percentText;
    }

    function actualizarStats() {
        const totalPendientesEl = document.getElementById('totalPendientes');
        const totalAprobadosEl = document.getElementById('totalAprobados');
        const tiempoEstimadoEl = document.getElementById('tiempoEstimado');

        if (totalPendientesEl) {
            totalPendientesEl.textContent = pendientes.length;
        }

        if (totalAprobadosEl) {
            totalAprobadosEl.textContent = stats.totalAprobados;
        }

        if (tiempoEstimadoEl) {
            const tiempoEstimado = pendientes.length * 2; // 2 minutos por producto
            tiempoEstimadoEl.textContent = `${tiempoEstimado} min`;
        }
    }

    function mostrarMensajeFinal() {
        mostrarTableContainer(false);
        
        const mensajeFinal = document.getElementById('mensajeFinal');
        const nextReviewDateEl = document.getElementById('nextReviewDate');
        const completedStatsEl = document.getElementById('completedStats');
        const timeStatsEl = document.getElementById('timeStats');
        
        if (mensajeFinal) {
            mensajeFinal.style.display = 'block';
        }
        
        if (nextReviewDateEl) {
            nextReviewDateEl.textContent = getNextReviewDate();
        }
        
        if (completedStatsEl) {
            completedStatsEl.textContent = `${stats.totalAprobados} productos aprobados`;
        }
        
        if (timeStatsEl && stats.tiempoInicio) {
            const tiempoTranscurrido = Math.round((new Date() - stats.tiempoInicio) / (1000 * 60));
            timeStatsEl.textContent = `Completado en ${tiempoTranscurrido} minutos`;
        }
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

    // ==================== VALIDATION ====================
    function validarCamposCompletos() {
        const productosIncompletos = [];
        
        pendientes.forEach((producto, index) => {
            const selectLabel = document.getElementById(`label-${index}`);
            
            if (!selectLabel?.value) {
                productosIncompletos.push(producto.id_unit);
            }
        });
        
        return productosIncompletos;
    }

    // ==================== NOTIFICATIONS ====================
    function mostrarNotificacion(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed notification-toast`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px; max-width: 400px;';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    function mostrarError(titulo, error) {
        Swal.fire({
            icon: 'error',
            title: titulo,
            text: error.message || error,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
        });
    }

    function mostrarAdvertencia(mensaje) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: mensaje,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f39c12'
        });
    }

    function mostrarInfo(mensaje) {
        Swal.fire({
            icon: 'info',
            title: 'Información',
            text: mensaje,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3085d6'
        });
    }

    function mostrarResultadoAprobacion(aprobados, errores) {
        if (errores.length === 0) {
            Swal.fire({
                icon: 'success',
                title: '¡Aprobación completada!',
                html: `
                    <div class="text-center">
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Se aprobaron <strong>${aprobados}</strong> productos exitosamente
                        </div>
                    </div>
                `,
                confirmButtonText: 'Excelente',
                confirmButtonColor: '#28a745'
            });
        } else if (aprobados > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Aprobación parcial',
                html: `
                    <div class="text-start">
                        <div class="alert alert-success mb-2">
                            <i class="fas fa-check me-2"></i>
                            <strong>${aprobados}</strong> productos aprobados
                        </div>
                        <div class="alert alert-danger mb-2">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>${errores.length}</strong> productos con errores
                        </div>
                    </div>
                `,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f39c12'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en la aprobación',
                text: 'No se pudo aprobar ningún producto. Revisa la conexión.',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#dc3545'
            });
        }
    }

    // ==================== UTILITY FUNCTIONS ====================
    function getCurrentUser() {
        return localStorage.getItem('currentUser') || 'Sistema';
    }

    // ==================== GLOBAL FUNCTIONS ====================
    window.aprobarProducto = aprobarProducto;
    window.aprobarTodos = aprobarTodos;
    window.aprobarSeleccionados = aprobarSeleccionados;
    window.toggleProductSelection = toggleProductSelection;
    window.toggleSelectAll = toggleSelectAll;
    window.generarReporte = generarReporte;
    window.iniciarNuevaRevision = iniciarNuevaRevision;

    // ==================== INITIALIZATION ====================
    inicializar();
});