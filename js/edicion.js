function editSelectedProducts() {
  const selectedProducts = [];
  
  // Recoger los productos seleccionados
  document.querySelectorAll('#inventoryTableBody input[type="checkbox"]:checked').forEach(checkbox => {
    const row = checkbox.closest('tr');
    const id = row.cells[1].textContent; // ID del producto
    const articulo = row.cells[2].textContent; // Artículo
    const modelo = row.cells[3].textContent; // Modelo
    const edificio = row.cells[4].textContent; // Edificio
    const area = row.cells[5].textContent; // Área
    const status = row.cells[6].textContent; // Status
    const check = row.cells[7].textContent; // Check
    
    selectedProducts.push({
      ID: id,
      ARTICULO: articulo,
      MODELO: modelo,
      EDIFICIO: edificio,
      AREA: area,
      STATUS: status,
      CHECK: check
    });
  });

  if (selectedProducts.length === 0) {
    alert("Selecciona al menos un producto para editar.");
    return;
  }

  // Guardar los productos seleccionados en localStorage
  localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));

  // Redirigir a la página de edición
  window.location.href = 'editItems.html';
}