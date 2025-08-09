document.addEventListener('DOMContentLoaded', () => {
  const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  const form = document.getElementById('editForm');
  const selectedProductsList = document.getElementById('selectedProductsList');
  
  // Mostrar productos seleccionados
  function showSelectedProducts() {
    selectedProductsList.innerHTML = selectedProducts.map(product => `
      <div>${product.ARTICULO}</div>
    `).join('');
  }

  // Llenar formulario con datos del producto seleccionado
  function fillForm(product) {
    form.articulo.value = product.ARTICULO;
    form.modelo.value = product.MODELO;
    form.edificio.value = product.EDIFICIO;
    form.area.value = product.AREA;
    // Añadir los otros campos de manera similar
  }

  // Avanzar al siguiente producto
  function nextProduct() {
    if (selectedProducts.length > 0) {
      const currentProduct = selectedProducts.shift(); // Extraer el primer producto
      fillForm(currentProduct); // Llenar el formulario con los datos del producto
      showSelectedProducts(); // Actualizar la lista de productos seleccionados
    } else {
      alert("¡Ya no hay más productos para editar!");
    }
  }

  // Almacenar cambios en cache
  function submitChanges() {
    if (confirm("¿Estás seguro de realizar estas modificaciones?")) {
      // Aquí puedes enviar los cambios y realizar la actualización en cache
      alert("Los cambios han sido guardados.");
    }
  }

  // Mostrar el primer producto por defecto
  nextProduct();
});
