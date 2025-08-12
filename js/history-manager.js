// Sistema de gestión de historial para el inventario
class HistoryManager {
    constructor() {
        this.apiBaseUrl = 'https://healtyapi.bsite.net/api';
        this.currentUser = this.getCurrentUser();
    }

    // Obtener usuario actual (puedes ajustar según tu sistema de autenticación)
    getCurrentUser() {
        // Por ahora usamos el usuario del header, pero puedes obtenerlo de localStorage, session, etc.
        const userElement = document.querySelector('.user-box span');
        return {
            id: 1, // ID del usuario - deberías obtenerlo de tu sistema de auth
            name: userElement ? userElement.textContent : 'Usuario Desconocido'
        };
    }

    // Registrar una acción en el historial
    async logAction(actionType, unitId, details = {}) {
        try {
            const historyEntry = {
                unitId: parseInt(unitId),
                userId: this.currentUser.id,
                actionType: actionType,
                actionDetails: JSON.stringify({
                    userName: this.currentUser.name,
                    timestamp: new Date().toISOString(),
                    ...details
                }),
                actionDate: new Date().toISOString()
            };

            const response = await fetch(`${this.apiBaseUrl}/histories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(historyEntry)
            });

            if (!response.ok) {
                throw new Error(`Error al registrar historial: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`Acción registrada en historial: ${actionType}`, result);
            return result;

        } catch (error) {
            console.error('Error al registrar acción en historial:', error);
            // No lanzamos error para no interrumpir la funcionalidad principal
        }
    }

    // Registrar múltiples acciones (para operaciones en lote)
    async logBulkActions(actionType, unitIds, details = {}) {
        const promises = unitIds.map(unitId => 
            this.logAction(actionType, unitId, {
                ...details,
                bulkOperation: true,
                totalItems: unitIds.length
            })
        );

        try {
            await Promise.allSettled(promises);
            console.log(`Acciones en lote registradas: ${actionType} para ${unitIds.length} elementos`);
        } catch (error) {
            console.error('Error al registrar acciones en lote:', error);
        }
    }

    // Obtener historial por unidad
    async getHistoryByUnit(unitId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/histories/byUnit?unitId=${unitId}`);
            if (!response.ok) {
                throw new Error(`Error al obtener historial: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener historial por unidad:', error);
            return [];
        }
    }

    // Obtener historial por usuario
    async getHistoryByUser(userId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/histories/byUser?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`Error al obtener historial: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener historial por usuario:', error);
            return [];
        }
    }

    // Obtener todo el historial
    async getAllHistory() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/histories`);
            if (!response.ok) {
                throw new Error(`Error al obtener historial: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener todo el historial:', error);
            return [];
        }
    }

    // Métodos específicos para diferentes tipos de acciones
    async logProductCreation(unitId, productData) {
        return this.logAction('PRODUCT_CREATED', unitId, {
            productName: productData.name,
            productModel: productData.model,
            location: productData.location,
            area: productData.area
        });
    }

    async logProductUpdate(unitId, oldData, newData) {
        const changes = this.detectChanges(oldData, newData);
        return this.logAction('PRODUCT_UPDATED', unitId, {
            changes: changes,
            productName: newData.name || oldData.name
        });
    }

    async logProductDeactivation(unitId, productData, reason = '') {
        return this.logAction('PRODUCT_DEACTIVATED', unitId, {
            productName: productData.name,
            productModel: productData.model,
            reason: reason,
            previousStatus: productData.status
        });
    }

    async logProductReactivation(unitId, productData) {
        return this.logAction('PRODUCT_REACTIVATED', unitId, {
            productName: productData.name,
            productModel: productData.model
        });
    }

    async logLoanRequest(unitId, productData, loanDetails) {
        return this.logAction('LOAN_REQUESTED', unitId, {
            productName: productData.name,
            borrower: loanDetails.borrower,
            loanDate: loanDetails.loanDate,
            expectedReturn: loanDetails.expectedReturn
        });
    }

    async logLoanReturn(unitId, productData, returnDetails) {
        return this.logAction('LOAN_RETURNED', unitId, {
            productName: productData.name,
            returnDate: returnDetails.returnDate,
            condition: returnDetails.condition
        });
    }

    async logStatusChange(unitId, productData, oldStatus, newStatus) {
        return this.logAction('STATUS_CHANGED', unitId, {
            productName: productData.name,
            oldStatus: oldStatus,
            newStatus: newStatus
        });
    }

    async logLocationChange(unitId, productData, oldLocation, newLocation) {
        return this.logAction('LOCATION_CHANGED', unitId, {
            productName: productData.name,
            oldLocation: oldLocation,
            newLocation: newLocation
        });
    }

    async logCheckPerformed(unitId, productData, checkResults) {
        return this.logAction('CHECK_PERFORMED', unitId, {
            productName: productData.name,
            checkType: checkResults.type,
            result: checkResults.result,
            observations: checkResults.observations
        });
    }

    // Detectar cambios entre datos antiguos y nuevos
    detectChanges(oldData, newData) {
        const changes = {};
        
        // Lista de campos a comparar
        const fieldsToCompare = [
            'name', 'model', 'status', 'location', 'area', 
            'guardian', 'observations', 'labelStatus'
        ];

        fieldsToCompare.forEach(field => {
            if (oldData[field] !== newData[field]) {
                changes[field] = {
                    old: oldData[field],
                    new: newData[field]
                };
            }
        });

        return changes;
    }

    // Formatear fecha para mostrar
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // Obtener icono según tipo de acción
    getActionIcon(actionType) {
        const icons = {
            'PRODUCT_CREATED': 'fas fa-plus-circle',
            'PRODUCT_UPDATED': 'fas fa-edit',
            'PRODUCT_DEACTIVATED': 'fas fa-times-circle',
            'PRODUCT_REACTIVATED': 'fas fa-check-circle',
            'LOAN_REQUESTED': 'fas fa-hand-holding',
            'LOAN_RETURNED': 'fas fa-undo',
            'STATUS_CHANGED': 'fas fa-exchange-alt',
            'LOCATION_CHANGED': 'fas fa-map-marker-alt',
            'CHECK_PERFORMED': 'fas fa-clipboard-check'
        };
        return icons[actionType] || 'fas fa-info-circle';
    }

    // Obtener color según tipo de acción
    getActionColor(actionType) {
        const colors = {
            'PRODUCT_CREATED': 'success',
            'PRODUCT_UPDATED': 'primary',
            'PRODUCT_DEACTIVATED': 'danger',
            'PRODUCT_REACTIVATED': 'success',
            'LOAN_REQUESTED': 'warning',
            'LOAN_RETURNED': 'info',
            'STATUS_CHANGED': 'secondary',
            'LOCATION_CHANGED': 'info',
            'CHECK_PERFORMED': 'primary'
        };
        return colors[actionType] || 'secondary';
    }

    // Obtener descripción legible según tipo de acción
    getActionDescription(actionType) {
        const descriptions = {
            'PRODUCT_CREATED': 'Producto creado',
            'PRODUCT_UPDATED': 'Producto actualizado',
            'PRODUCT_DEACTIVATED': 'Producto desactivado',
            'PRODUCT_REACTIVATED': 'Producto reactivado',
            'LOAN_REQUESTED': 'Préstamo solicitado',
            'LOAN_RETURNED': 'Préstamo devuelto',
            'STATUS_CHANGED': 'Estado modificado',
            'LOCATION_CHANGED': 'Ubicación cambiada',
            'CHECK_PERFORMED': 'Revisión realizada'
        };
        return descriptions[actionType] || 'Acción realizada';
    }
}

// Crear instancia global del gestor de historial
window.historyManager = new HistoryManager();

// Función para integrar con las acciones existentes
function integrateHistoryLogging() {
    // Interceptar función de desactivar productos
    if (window.desactivarProductosSeleccionados) {
        const originalDeactivate = window.desactivarProductosSeleccionados;
        window.desactivarProductosSeleccionados = async function(reason = '') {
            const selectedItems = getSelectedItems();
            
            // Ejecutar la función original
            const result = await originalDeactivate.call(this, reason);
            
            // Registrar en historial si la operación fue exitosa
            if (result && selectedItems.length > 0) {
                const unitIds = selectedItems.map(item => item.id_unit);
                await window.historyManager.logBulkActions('PRODUCT_DEACTIVATED', unitIds, {
                    reason: reason,
                    deactivatedBy: window.historyManager.currentUser.name
                });
            }
            
            return result;
        };
    }

    // Interceptar función de solicitar préstamo
    if (window.solicitarPrestamo) {
        const originalLoan = window.solicitarPrestamo;
        window.solicitarPrestamo = async function(loanData) {
            const selectedItems = getSelectedItems();
            
            // Ejecutar la función original
            const result = await originalLoan.call(this, loanData);
            
            // Registrar en historial si la operación fue exitosa
            if (result && selectedItems.length > 0) {
                for (const item of selectedItems) {
                    await window.historyManager.logLoanRequest(item.id_unit, item, loanData);
                }
            }
            
            return result;
        };
    }

    // Función auxiliar para obtener elementos seleccionados
    function getSelectedItems() {
        const selectedRows = document.querySelectorAll('input[type="checkbox"]:checked');
        const items = [];
        
        selectedRows.forEach(checkbox => {
            if (!checkbox.closest('th')) { // Excluir el checkbox del header
                const row = checkbox.closest('tr');
                if (row) {
                    const unitId = row.getAttribute('data-id');
                    if (unitId) {
                        // Buscar los datos del item en el inventario actual
                        const allData = window.getInventoryData ? window.getInventoryData() : [];
                        const itemData = allData.find(item => item.id_unit.toString() === unitId);
                        if (itemData) {
                            items.push(itemData);
                        }
                    }
                }
            }
        });
        
        return items;
    }
}

// Inicializar integración cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un momento para que se carguen las otras funciones
    setTimeout(integrateHistoryLogging, 1000);
});

// Exportar para uso global
window.HistoryManager = HistoryManager;