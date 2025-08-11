document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el botón de editar está disponible
  const editButton = document.querySelector('button[onclick="editSelectedProducts()"]');
  
  if (editButton) {
    // Asegúrate de que el evento solo se agregue una vez que el DOM esté cargado
    editButton.addEventListener('click', editSelectedProducts);
  }
});

// Función para manejar la edición de productos seleccionados
function editSelectedProducts() {
  const rows = document.querySelectorAll('#inventoryTableBody tr');
  let selectedProductIds = [];

  // Recorrer las filas y verificar si los checkboxes están seleccionados
  rows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const cells = row.querySelectorAll('td');

    // Verificar que la fila tenga al menos 2 celdas
    if (cells.length >= 2) {
      const productId = cells[1].textContent; // Obtener solo el ID del producto desde la segunda celda
      if (checkbox.checked) {
        selectedProductIds.push(productId); // Agregar solo la ID seleccionada
      }
    }
  });

  // Si no se seleccionaron productos, mostrar una advertencia y redirigir
  if (selectedProductIds.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No se seleccionaron productos',
      text: 'Por favor, selecciona al menos un producto para editar.',
      confirmButtonText: 'Aceptar'
    });
    return; // No continuar con el código si no hay productos seleccionados
  }

  // Almacenar solo las IDs de los productos seleccionados en localStorage
  localStorage.setItem('selectedProducts', JSON.stringify(selectedProductIds));

  // Redirigir automáticamente a la página de edición
  window.location.href = 'editItems.html';
}

