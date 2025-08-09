document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/articulos');
    const data = await response.json();
    renderArticulos(data);
  } catch (error) {
    console.error('Error al obtener los artículos:', error);
  }
});

function renderArticulos(articulos) {
  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = '';

  articulos.forEach(art => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>${art.id || ''}</td>
      <td>${art.nombre || ''}</td>
      <td>${art.modelo || ''}</td>
      <td>${art.edificio || ''}</td>
      <td>${art.area || ''}</td>
      <td>${art.status || ''}</td>
      <td>${art.check || ''}</td>
    `;
    tbody.appendChild(row);
  });
}
