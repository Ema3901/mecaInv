document.addEventListener('DOMContentLoaded', () => {
  const selectedProductIds = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  const form = document.getElementById('editForm');
  const selectedProductsList = document.getElementById('selectedProductsList');
  const loadingScreen = document.getElementById('loading'); // Pantalla de carga

  // Si no hay productos seleccionados, redirigir a la página principal
  if (selectedProductIds.length === 0) {
    alert("No se seleccionaron productos para editar.");
    window.location.href = 'index.html';
  }

  let currentProductIndex = 0; // Variable para rastrear el índice del producto actual

  // Mostrar productos seleccionados
  function showSelectedProducts() {
    selectedProductsList.innerHTML = selectedProductIds.map(id => `
      <div>Producto ID: ${id}</div>
    `).join('');
  }

  // Llenar formulario con datos del producto seleccionado
  function fillForm(product) {
    form.articulo.value = product.Product.name;
    form.modelo.value = product.Product.model;
    form.edificio.value = product.Product.specs; // Usamos specs como ejemplo de otro campo
    form.area.value = product.Area.area_name; // Usando el nombre del área como ejemplo
    // Añadir más campos según lo que la API requiere
  }

  // Solicitar los datos del producto a la API usando la ID
  function getProductData(productId) {
    showLoading(true); // Mostrar pantalla de carga

    fetch(`https://healtyapi.bsite.net/api/product_units/${productId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        return response.json();
      })
      .then(data => {
        fillForm(data); // Llenar el formulario con los datos del producto
        showLoading(false); // Ocultar pantalla de carga
      })
      .catch(error => {
        console.error("Error al obtener los datos del producto:", error);
        alert("Hubo un problema al cargar los datos del producto.");
        showLoading(false); // Ocultar pantalla de carga
      });
  }

  // Función para mostrar/ocultar la pantalla de carga
  function showLoading(show) {
    if (show) {
      loadingScreen.style.display = "block"; // Mostrar el spinner
    } else {
      loadingScreen.style.display = "none"; // Ocultar el spinner
    }
  }

  // Mostrar el producto actual
  function showCurrentProduct() {
    const productId = selectedProductIds[currentProductIndex];
    getProductData(productId);
    showSelectedProducts();

    // Habilitar o deshabilitar los botones según sea necesario
    document.querySelector('.btn-primary').disabled = currentProductIndex === selectedProductIds.length - 1; // Deshabilitar "Siguiente" al final
    document.querySelector('.btn-secondary').disabled = currentProductIndex === 0; // Deshabilitar "Retroceder" al inicio
  }

  // Avanzar al siguiente producto
  function nextProduct() {
    if (currentProductIndex < selectedProductIds.length - 1) {
      currentProductIndex++;
      showCurrentProduct();
    }
  }

  // Retroceder al producto anterior
  function previousProduct() {
    if (currentProductIndex > 0) {
      currentProductIndex--;
      showCurrentProduct();
    }
  }

  // Enviar cambios al servidor
  function submitChanges() {
    if (confirm("¿Estás seguro de realizar estas modificaciones?")) {
      showLoading(true); // Mostrar la pantalla de carga

      // Preparar los datos para la actualización
      const productData = {
        id_unit: selectedProductIds[currentProductIndex], // Usar el id del producto
        serial_number: form.serial_number ? form.serial_number.value : '',
        internal_code: form.internal_code ? form.internal_code.value : '',
        observations: form.observations ? form.observations.value : '',
        registration_date: form.registration_date ? form.registration_date.value : '',
        fk_inventory: form.fk_inventory ? form.fk_inventory.value : null,
        fk_disabled: form.fk_disabled ? form.fk_disabled.value : null,
        fk_pending: form.fk_pending ? form.fk_pending.value : null,
        fk_laboratory: form.fk_laboratory ? form.fk_laboratory.value : null,
        fk_location: form.fk_location ? form.fk_location.value : null,
        fk_guardian: form.fk_guardian ? form.fk_guardian.value : null,
        notes: form.notes ? form.notes.value : '',
        fk_area: form.fk_area ? form.fk_area.value : null,
        fk_status_label: form.fk_status_label ? form.fk_status_label.value : null,
        area: form.area ? form.area.value : null,
        borroweds: [], // Aquí deberías manejar los elementos de "borroweds" si es necesario
        disabled_: form.disabled_ ? form.disabled_.checked : null,
        histories: [], // Aquí deberías manejar los elementos de "histories" si es necesario
        inventory: form.inventory ? form.inventory.value : null,
        laboratory: form.laboratory ? form.laboratory.value : null,
        location_: form.location_ ? form.location_.value : null,
        pending: form.pending ? form.pending.value : null,
        user: form.user ? form.user.value : null,
        status_l: form.status_l ? form.status_l.value : null
      };

      // Realizar el PUT para actualizar el producto
      fetch(`https://healtyapi.bsite.net/api/product_units/${productData.id_unit}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_units: productData }) // Enviar todos los parámetros requeridos
      })
        .then(response => response.json())
        .then(data => {
          alert("Los cambios han sido guardados.");
          showLoading(false); // Ocultar la pantalla de carga
          localStorage.removeItem('selectedProducts'); // Borrar el cache después de enviar
          window.location.href = 'index.html'; // Regresar a la página principal
        })
        .catch(error => {
          alert("Hubo un error al guardar los cambios.");
          console.error("Error al enviar los datos:", error);
          showLoading(false); // Ocultar la pantalla de carga
        });
    }
  }

  // Cancelar y borrar cache
  function cancelEditing() {
    if (confirm("¿Seguro que deseas cancelar? Todos los cambios se perderán.")) {
      localStorage.removeItem('selectedProducts'); // Borrar el cache
      window.location.href = 'index.html'; // Regresar a la página principal
    }
  }

  // Asignar los eventos a los botones
  document.querySelector('.btn-primary').addEventListener('click', nextProduct); // Siguiente
  document.querySelector('.btn-secondary').addEventListener('click', previousProduct); // Retroceder
  document.querySelector('.btn-success').addEventListener('click', submitChanges); // Enviar todos
  document.querySelector('.btn-secondary.cancel').addEventListener('click', cancelEditing); // Cancelar

  // Inicializar con el primer producto
  showCurrentProduct();
});
