// Array de productos de prueba
const inventoryData = [
    {
        CHECK: "SI",
        STATUS: "BUENA",
        LABEL: "NO",
        ID: 261384,
        ARTICULO: "Silla plegable",
        MARCA: "Office Depot",
        MODELO: "CS-1128-B",
        OBSERVACIONES: "Negro, tela/metal, 75cm x 48.5cm x 46cm, respaldo medio / mecanismo tubular de acero / soporte trasero de carga / reposa pies",
        AREA: "Dirección",
        RESGUARDANTE: "ING. DIEGO CRUZ ORTEGA",
        EDIFICIO: "A",
        TIPO: "Cons"
    },
    {
        CHECK: "NO",
        STATUS: "DAÑADA",
        LABEL: "SI",
        ID: 261385,
        ARTICULO: "Escritorio ejecutivo",
        MARCA: "Ofitech",
        MODELO: "EX-450",
        OBSERVACIONES: "Madera maciza, color nogal, con cajones laterales y superficie de vidrio",
        AREA: "Oficina Principal",
        RESGUARDANTE: "LIC. MARÍA PÉREZ",
        EDIFICIO: "B",
        TIPO: "Cont"
    }
    // Agrega más productos aquí según sea necesario
];

// Función para mostrar los productos en la tabla
function renderTable(data) {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    inventoryTableBody.innerHTML = ''; // Limpiar filas existentes

    data.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('item-row');
        row.setAttribute('data-id', item.ID);

        const statusLower = item.STATUS.toLowerCase();
        const statusClass = statusLower === 'buena' ? 'status-good' : (statusLower === 'dañado' || statusLower === 'dañada' ? 'status-bad' : 'status-pending');
        const checkLower = item.CHECK.toLowerCase();
        const checkClass = checkLower === 'si' || checkLower === 'completed' ? 'status-good' : 'status-pending';

        row.innerHTML = `
            <td><input type="checkbox" class="checkbox-select"></td>
            <td>${item.ID}</td>
            <td>${item.ARTICULO}</td>
            <td>${item.MODELO}</td>
            <td>${item.EDIFICIO}</td>
            <td>${item.AREA}</td>
            <td><span class="badge-status ${statusClass}">${item.STATUS}</span></td>
            <td><span class="badge-status ${checkClass}">${item.CHECK}</span></td>
            <td><button class="btn btn-warning btn-sm update-btn">Actualizar</button></td>
        `;

        inventoryTableBody.appendChild(row);

        // Añadir evento para actualizar el producto
        const updateButton = row.querySelector('.update-btn');
        updateButton.addEventListener('click', () => {
            updateProduct(item.ID);
        });

        // Evento para marcar o desmarcar la casilla de verificación
        const checkbox = row.querySelector('.checkbox-select');
        checkbox.addEventListener('change', () => {
            // Aquí puedes agregar la lógica para manejar la selección para borrado o edición
            console.log(`Producto ${item.ARTICULO} seleccionado para borrado: ${checkbox.checked}`);
        });
    });
}

// Función para actualizar el producto
function updateProduct(productId) {
    const product = inventoryData.find(item => item.ID === productId);
    if (!product) {
        alert('Producto no encontrado');
        return;
    }

    // Rellenar el formulario con los datos del producto
    document.getElementById('productId').value = product.ID;
    document.getElementById('productArticle').value = product.ARTICULO;
    document.getElementById('productStatus').value = product.STATUS.toLowerCase();
    document.getElementById('productCheck').value = product.CHECK.toLowerCase();

    // Mostrar el formulario de actualización
    const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
    updateModal.show();

    // Actualizar el producto cuando se envíe el formulario
    document.getElementById('updateForm').addEventListener('submit', (event) => {
        event.preventDefault();

        // Obtener los nuevos valores
        const updatedStatus = document.getElementById('productStatus').value;
        const updatedCheck = document.getElementById('productCheck').value;

        // Actualizar el producto en el array (esto puede hacerse con una llamada a tu API)
        product.STATUS = updatedStatus.toUpperCase();
        product.CHECK = updatedCheck.toUpperCase();

        // Mostrar mensaje de éxito
        alert('Producto actualizado con éxito');

        // Cerrar el modal y recargar la tabla
        const updateModalInstance = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
        updateModalInstance.hide();

        renderTable(inventoryData);
    });
}

// Función para agregar un nuevo producto (para pruebas)
function addProduct(product) {
    inventoryData.push(product);
    renderTable(inventoryData);
}

// Cargar productos de prueba al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderTable(inventoryData);
    // Agregar un producto de prueba
    const newProduct = {
        CHECK: "NO",
        STATUS: "BUENA",
        LABEL: "SI",
        ID: 261399,
        ARTICULO: "Impresora 3D",
        MARCA: "Creality",
        MODELO: "Ender 3",
        OBSERVACIONES: "Área de impresión 220x220x250mm",
        AREA: "Departamento de Ingeniería",
        RESGUARDANTE: "ING. MIGUEL SÁNCHEZ",
        EDIFICIO: "B",
        TIPO: "Cons"
    };
    addProduct(newProduct);
});
