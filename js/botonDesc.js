    document.addEventListener("DOMContentLoaded", function() {
      const desactivarBtn = document.getElementById('desactivarBtn');
      if (desactivarBtn) {
        desactivarBtn.addEventListener('click', desactivarProductos);
      } else {
        console.error('Botón de desactivar no encontrado');
      }
    });