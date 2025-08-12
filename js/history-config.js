// Configuración del sistema de historial
// Este archivo permite personalizar el comportamiento del sistema de historial

window.HistoryConfig = {
    // Configuración de la API
    api: {
        baseUrl: 'https://healtyapi.bsite.net/api',
        timeout: 10000, // 10 segundos
        retryAttempts: 3,
        retryDelay: 1000 // 1 segundo entre intentos
    },

    // Configuración de tipos de acción
    actionTypes: {
        PRODUCT_CREATED: {
            label: 'Producto Creado',
            icon: 'fas fa-plus-circle',
            color: 'success',
            description: 'Un nuevo producto fue agregado al inventario',
            priority: 1
        },
        PRODUCT_UPDATED: {
            label: 'Producto Actualizado',
            icon: 'fas fa-edit',
            color: 'primary',
            description: 'Los datos del producto fueron modificados',
            priority: 2
        },
        PRODUCT_DEACTIVATED: {
            label: 'Producto Desactivado',
            icon: 'fas fa-times-circle',
            color: 'danger',
            description: 'El producto fue desactivado del inventario',
            priority: 3
        },
        PRODUCT_REACTIVATED: {
            label: 'Producto Reactivado',
            icon: 'fas fa-check-circle',
            color: 'success',
            description: 'El producto fue reactivado en el inventario',
            priority: 2
        },
        LOAN_REQUESTED: {
            label: 'Préstamo Solicitado',
            icon: 'fas fa-hand-holding',
            color: 'warning',
            description: 'Se solicitó un préstamo del producto',
            priority: 2
        },
        LOAN_RETURNED: {
            label: 'Préstamo Devuelto',
            icon: 'fas fa-undo',
            color: 'info',
            description: 'El producto fue devuelto de un préstamo',
            priority: 2
        },
        STATUS_CHANGED: {
            label: 'Estado Modificado',
            icon: 'fas fa-exchange-alt',
            color: 'secondary',
            description: 'El estado del producto fue cambiado',
            priority: 2
        },
        LOCATION_CHANGED: {
            label: 'Ubicación Cambiada',
            icon: 'fas fa-map-marker-alt',
            color: 'info',
            description: 'La ubicación del producto fue modificada',
            priority: 2
        },
        CHECK_PERFORMED: {
            label: 'Revisión Realizada',
            icon: 'fas fa-clipboard-check',
            color: 'primary',
            description: 'Se realizó una revisión del producto',
            priority: 1
        },
        MAINTENANCE_SCHEDULED: {
            label: 'Mantenimiento Programado',
            icon: 'fas fa-tools',
            color: 'warning',
            description: 'Se programó mantenimiento para el producto',
            priority: 2
        },
        MAINTENANCE_COMPLETED: {
            label: 'Mantenimiento Completado',
            icon: 'fas fa-check-double',
            color: 'success',
            description: 'El mantenimiento del producto fue completado',
            priority: 2
        },
        DAMAGE_REPORTED: {
            label: 'Daño Reportado',
            icon: 'fas fa-exclamation-triangle',
            color: 'danger',
            description: 'Se reportó un daño en el producto',
            priority: 3
        },
        REPAIR_COMPLETED: {
            label: 'Reparación Completada',
            icon: 'fas fa-wrench',
            color: 'success',
            description: 'La reparación del producto fue completada',
            priority: 2
        }
    },

    // Configuración de la interfaz
    ui: {
        // Paginación
        itemsPerPage: 20,
        maxItemsToLoad: 100,
        
        // Animaciones
        enableAnimations: true,
        animationDuration: 300,
        
        // Colores de tema
        theme: {
            primary: '#0d6efd',
            secondary: '#6c757d',
            success: '#198754',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#0dcaf0',
            light: '#f8f9fa',
            dark: '#212529'
        },
        
        // Formateo de fechas
        dateFormat: {
            locale: 'es-MX',
            options: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        },
        
        // Configuración de modales
        modal: {
            backdrop: true,
            keyboard: true,
            focus: true
        }
    },

    // Configuración de notificaciones
    notifications: {
        enabled: true,
        position: 'top-end',
        duration: 3000,
        showOnActions: {
            PRODUCT_CREATED: true,
            PRODUCT_UPDATED: true,
            PRODUCT_DEACTIVATED: true,
            LOAN_REQUESTED: true,
            LOAN_RETURNED: true
        }
    },

    // Configuración de validaciones
    validation: {
        requireReason: {
            PRODUCT_DEACTIVATED: true,
            DAMAGE_REPORTED: true,
            MAINTENANCE_SCHEDULED: false
        },
        maxReasonLength: 500,
        requiredFields: {
            LOAN_REQUESTED: ['borrower', 'loanDate', 'returnDate'],
            MAINTENANCE_SCHEDULED: ['scheduledDate', 'maintenanceType']
        }
    },

    // Configuración de filtros
    filters: {
        defaultDateRange: 30, // días
        maxDateRange: 365, // días
        allowedDateRanges: [
            { label: 'Hoy', days: 0 },
            { label: 'Última semana', days: 7 },
            { label: 'Último mes', days: 30 },
            { label: 'Últimos 3 meses', days: 90 },
            { label: 'Último año', days: 365 }
        ]
    },

    // Configuración de exportación
    export: {
        enabled: true,
        formats: ['excel', 'pdf', 'csv'],
        maxRecords: 10000,
        includeDetails: true,
        filename: 'historial_inventario'
    },

    // Configuración de permisos (opcional)
    permissions: {
        canViewAll: true,
        canViewOwnActions: true,
        canDeleteHistory: false,
        canExportHistory: true,
        restrictedActions: [] // Array de tipos de acción restringidos
    },

    // Configuración de logging local
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        maxLogEntries: 1000,
        logToConsole: true,
        logToStorage: false
    },

    // Configuración de caché
    cache: {
        enabled: true,
        ttl: 300000, // 5 minutos en millisegundos
        maxEntries: 100,
        storageKey: 'inventory_history_cache'
    }
};

// Función para obtener configuración específica
window.getHistoryConfig = function(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], window.HistoryConfig);
};

// Función para establecer configuración
window.setHistoryConfig = function(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, window.HistoryConfig);
    target[lastKey] = value;
};

// Función para validar configuración
window.validateHistoryConfig = function() {
    const errors = [];
    
    // Validar URL de API
    if (!window.HistoryConfig.api.baseUrl) {
        errors.push('API baseUrl is required');
    }
    
    // Validar tipos de acción
    if (!window.HistoryConfig.actionTypes || Object.keys(window.HistoryConfig.actionTypes).length === 0) {
        errors.push('Action types configuration is required');
    }
    
    // Validar configuración de UI
    if (window.HistoryConfig.ui.itemsPerPage <= 0) {
        errors.push('UI itemsPerPage must be greater than 0');
    }
    
    return errors;
};

// Función para aplicar configuración personalizada
window.applyHistoryConfig = function(customConfig) {
    if (customConfig && typeof customConfig === 'object') {
        window.HistoryConfig = mergeDeep(window.HistoryConfig, customConfig);
    }
};

// Función auxiliar para merge profundo de objetos
function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// Configuración extendida para diferentes tipos de usuario
window.HistoryConfig.userProfiles = {
    admin: {
        permissions: {
            canViewAll: true,
            canDeleteHistory: true,
            canExportHistory: true,
            canViewSystemActions: true
        },
        ui: {
            showAdvancedFilters: true,
            showBulkActions: true,
            showSystemLogs: true
        }
    },
    manager: {
        permissions: {
            canViewAll: true,
            canDeleteHistory: false,
            canExportHistory: true,
            canViewSystemActions: false
        },
        ui: {
            showAdvancedFilters: true,
            showBulkActions: true,
            showSystemLogs: false
        }
    },
    operator: {
        permissions: {
            canViewAll: false,
            canDeleteHistory: false,
            canExportHistory: false,
            canViewSystemActions: false
        },
        ui: {
            showAdvancedFilters: false,
            showBulkActions: false,
            showSystemLogs: false
        }
    }
};

// Configuración de alertas automáticas
window.HistoryConfig.alerts = {
    enabled: true,
    rules: [
        {
            name: 'multiple_deactivations',
            condition: 'actionType === "PRODUCT_DEACTIVATED" && count > 5 && timeframe < 3600000', // 1 hora
            message: 'Se han desactivado más de 5 productos en la última hora',
            severity: 'warning',
            notify: ['admin', 'manager']
        },
        {
            name: 'frequent_damage_reports',
            condition: 'actionType === "DAMAGE_REPORTED" && count > 3 && timeframe < 86400000', // 1 día
            message: 'Se han reportado más de 3 daños en las últimas 24 horas',
            severity: 'danger',
            notify: ['admin', 'manager']
        },
        {
            name: 'overdue_loans',
            condition: 'actionType === "LOAN_REQUESTED" && daysOverdue > 7',
            message: 'Hay préstamos vencidos por más de 7 días',
            severity: 'warning',
            notify: ['admin', 'manager']
        }
    ]
};

// Configuración de reportes automáticos
window.HistoryConfig.reports = {
    enabled: true,
    schedule: {
        daily: {
            enabled: true,
            time: '08:00',
            recipients: ['admin'],
            template: 'daily_summary'
        },
        weekly: {
            enabled: true,
            day: 'monday',
            time: '09:00',
            recipients: ['admin', 'manager'],
            template: 'weekly_report'
        },
        monthly: {
            enabled: true,
            day: 1,
            time: '10:00',
            recipients: ['admin', 'manager'],
            template: 'monthly_analysis'
        }
    },
    templates: {
        daily_summary: {
            title: 'Resumen Diario de Actividades',
            sections: ['new_products', 'deactivations', 'loans', 'damages'],
            format: 'html'
        },
        weekly_report: {
            title: 'Reporte Semanal del Inventario',
            sections: ['activity_summary', 'top_actions', 'users_activity', 'trends'],
            format: 'pdf'
        },
        monthly_analysis: {
            title: 'Análisis Mensual del Inventario',
            sections: ['complete_analysis', 'performance_metrics', 'recommendations'],
            format: 'pdf'
        }
    }
};

// Configuración de integración con sistemas externos
window.HistoryConfig.integrations = {
    email: {
        enabled: false,
        smtp: {
            host: '',
            port: 587,
            secure: false,
            auth: {
                user: '',
                pass: ''
            }
        }
    },
    webhook: {
        enabled: false,
        endpoints: [
            {
                name: 'teams_notification',
                url: '',
                events: ['PRODUCT_DEACTIVATED', 'DAMAGE_REPORTED'],
                format: 'teams'
            },
            {
                name: 'slack_notification',
                url: '',
                events: ['LOAN_REQUESTED', 'LOAN_RETURNED'],
                format: 'slack'
            }
        ]
    },
    backup: {
        enabled: false,
        schedule: 'daily',
        destination: 'cloud_storage',
        retention: 90 // días
    }
};

// Configuración de métricas y analíticas
window.HistoryConfig.analytics = {
    enabled: true,
    metrics: {
        trackUserActivity: true,
        trackProductUsage: true,
        trackLocationActivity: true,
        trackTimePatterns: true
    },
    dashboards: {
        realTime: {
            enabled: true,
            refreshInterval: 30000, // 30 segundos
            widgets: ['recent_activity', 'active_loans', 'pending_checks']
        },
        summary: {
            enabled: true,
            defaultPeriod: 'last_30_days',
            widgets: ['activity_chart', 'top_products', 'user_activity', 'status_distribution']
        }
    }
};

// Función para inicializar configuración basada en el perfil del usuario
window.initializeUserConfig = function(userProfile) {
    if (window.HistoryConfig.userProfiles[userProfile]) {
        const profileConfig = window.HistoryConfig.userProfiles[userProfile];
        window.applyHistoryConfig(profileConfig);
    }
};

// Función para obtener configuración de acción específica
window.getActionConfig = function(actionType) {
    return window.HistoryConfig.actionTypes[actionType] || {
        label: actionType,
        icon: 'fas fa-info-circle',
        color: 'secondary',
        description: 'Acción no configurada',
        priority: 2
    };
};

// Función para validar permisos
window.checkPermission = function(permission) {
    const permissions = window.getHistoryConfig('permissions') || {};
    return permissions[permission] === true;
};

// Función para aplicar tema personalizado
window.applyHistoryTheme = function(theme) {
    const themeConfig = window.getHistoryConfig('ui.theme');
    Object.keys(theme).forEach(key => {
        if (themeConfig[key]) {
            document.documentElement.style.setProperty(`--history-${key}`, theme[key]);
        }
    });
};

// Configuración de campos personalizados para diferentes tipos de acción
window.HistoryConfig.customFields = {
    MAINTENANCE_SCHEDULED: [
        {
            name: 'maintenanceType',
            label: 'Tipo de Mantenimiento',
            type: 'select',
            options: ['Preventivo', 'Correctivo', 'Predictivo'],
            required: true
        },
        {
            name: 'scheduledDate',
            label: 'Fecha Programada',
            type: 'date',
            required: true
        },
        {
            name: 'technician',
            label: 'Técnico Asignado',
            type: 'text',
            required: false
        },
        {
            name: 'estimatedDuration',
            label: 'Duración Estimada (horas)',
            type: 'number',
            required: false
        }
    ],
    DAMAGE_REPORTED: [
        {
            name: 'damageType',
            label: 'Tipo de Daño',
            type: 'select',
            options: ['Físico', 'Funcional', 'Estético', 'Eléctrico'],
            required: true
        },
        {
            name: 'severity',
            label: 'Severidad',
            type: 'select',
            options: ['Baja', 'Media', 'Alta', 'Crítica'],
            required: true
        },
        {
            name: 'reportedBy',
            label: 'Reportado por',
            type: 'text',
            required: true
        },
        {
            name: 'photos',
            label: 'Fotos del Daño',
            type: 'file',
            accept: 'image/*',
            multiple: true,
            required: false
        }
    ],
    LOAN_REQUESTED: [
        {
            name: 'department',
            label: 'Departamento Solicitante',
            type: 'select',
            options: ['IT', 'Administración', 'Producción', 'Mantenimiento'],
            required: true
        },
        {
            name: 'project',
            label: 'Proyecto/Actividad',
            type: 'text',
            required: false
        },
        {
            name: 'priority',
            label: 'Prioridad',
            type: 'select',
            options: ['Baja', 'Normal', 'Alta', 'Urgente'],
            required: true
        }
    ]
};

// Exportar configuración para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.HistoryConfig;
}

console.log('Configuración del sistema de historial cargada:', window.HistoryConfig);