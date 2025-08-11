
    async function desactivarProductos() {
  // Obtener los productos seleccionados
  const checkboxes = document.querySelectorAll('#inventoryTable tbody input[type="checkbox"]:checked');
  
  if (checkboxes.length === 0) {
    Swal.fire({
      title: 'Advertencia',
      text: 'No has seleccionado ningún producto.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  // Obtener los IDs de los productos seleccionados
  const productIds = Array.from(checkboxes).map(checkbox => {
    const row = checkbox.closest('tr');
    return row.querySelector('td:nth-child(2)').textContent.trim(); // ID del producto
  });

  Swal.fire({
    title: '¿Estás seguro?',
    text: '¡Esto eliminará los productos seleccionados!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://healtyapi.bsite.net/api/product unit/Delete?id=${productIds.join(',')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          // Eliminar las filas de los productos deshabilitados
          checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.remove();  // Eliminar la fila de la tabla
          });

          Swal.fire({
            title: 'Éxito',
            text: 'Los productos seleccionados han sido eliminados.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al deshabilitar los productos. Intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      } catch (error) {
        console.error('Error al desactivar productos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al conectarse con la API. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  });
}
