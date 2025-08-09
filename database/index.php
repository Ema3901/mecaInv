<?php
// Incluir archivo de conexión a la base de datos
include('db.php'); 

// Realizar consulta para obtener productos con los nombres de categoría y marca
$sql = "
    SELECT 
        inventory.id_p, 
        inventory.name AS product_name,
        category.c_name AS category_name, 
        inventory.description, 
        inventory.model, 
        brand.b_name AS brand_name,
        inventory.location, 
        inventory.observations, 
        inventory.fk_user
    FROM 
        inventory
    LEFT JOIN 
        category ON inventory.fk_category = category.id_category
    LEFT JOIN 
        brand ON inventory.fk_brand = brand.id_brand
";
$result = $conn->query($sql);

// Verificar si hay resultados
if ($result->num_rows > 0) {
    // Obtener todos los productos
    $products = $result->fetch_all(MYSQLI_ASSOC);
} else {
    // Si no hay productos, creamos un array vacío
    $products = [];
}

// Cerrar conexión
$conn->close();
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Inventario Dashboard</title>
  <link href="../css/bootstrap.min.css" rel="stylesheet" />  <!-- Ruta ajustada -->
  <link href="../css/font-awesome.min.css" rel="stylesheet" />  <!-- Ruta ajustada -->
  <link href="../css/style.css" rel="stylesheet" />  <!-- Ruta ajustada -->
  <link href="../css/index.css" rel="stylesheet" />  <!-- Ruta ajustada -->
</head>
<body>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="sidebar-header" title="Menú">
        Inventario
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li><a href="index.html" class="active"><i class="fas fa-cubes"></i> Inventario</a></li> <!-- Ruta ajustada -->
          <li><a href="deleteItems.html"><i class="fas fa-archive"></i> Desactivados</a></li> <!-- Ruta ajustada -->
          <li><a href="pendientesCheck.html"><i class="fas fa-exclamation-circle"></i> Pendientes Check</a></li> <!-- Ruta ajustada -->
          <li><a href="historial.html"><i class="fas fa-history"></i> Historial</a></li> <!-- Ruta ajustada -->
          <li><a href="productosOcupados.html"><i class="fas fa-user-clock"></i> Ocupados</a></li> <!-- Ruta ajustada -->
        </ul>
      </nav>
    </aside>
    <main class="main-content">
      <header class="main-header d-flex align-items-center justify-content-between flex-wrap">
        <h1>Inventario</h1>
        <a href="add_product.php" class="btn btn-success">Agregar Producto</a>


        <div class="user-box dropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="../img/stock.jpg" alt="User Avatar" id="profileDropdown" /> <!-- Ruta ajustada -->
          <span>Ann Lee</span>
          <i class="fas fa-chevron-down ml-2"></i>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
            <li><a class="dropdown-item" href="login.html" onclick="handleLogout()">Cerrar sesión</a></li> <!-- Ruta ajustada -->
          </ul>
        </div>
      </header>

      <div class="divider"></div>

      <div class="controls d-flex flex-wrap align-items-center gap-3 mb-3">
        <div class="search-box flex-grow-1 position-relative">
          <div class="search-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="busquedaInput" placeholder="Buscar por nombre o ID" />
            <i class="fas fa-times-circle clear-icon" style="position: absolute; right: 10px; cursor: pointer; color: #aaa;" onclick="limpiarBusqueda()"></i>
          </div>
        </div>

        <div class="filters-header d-flex justify-content-between w-100">
          <div class="filters d-flex gap-2 align-items-center">
            <button class="btn-filter" data-bs-toggle="modal" data-bs-target="#filterModal">
              <i class="fas fa-filter"></i> Filtrar
            </button>
            <button class="btn-filter" aria-label="Restablecer filtros" onclick="resetFilters()">
              Restablecer <i class="fas fa-sync-alt"></i>
            </button>
          </div>

          <div class="header-actions mb-3 d-flex gap-2">
            <button class="btn btn-danger">Desactivar</button>
            <button class="btn btn-secondary" onclick="editSelectedProducts()">Editar</button>
            <button class="btn btn-success" onclick="solicitarPrestamo()">
              <i class="fas fa-user-plus"></i> Solicitar préstamo
            </button>
            <button class="btn btn-primary" onclick="window.location.href='additem.html'">
              <i class="fas fa-plus"></i> Nuevos Productos
            </button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table id="inventoryTable">
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Seleccionar todo" /></th>
              <th>ID</th>
              <th>Artículo</th>
              <th>Modelo</th>
              <th>Edificio</th>
              <th>Área</th>
              <th>Status</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody id="inventoryTableBody">
            <?php
              // Verificamos si hay productos y los mostramos en la tabla
              if (count($products) > 0) {
                foreach ($products as $product) {
                  echo "<tr>
                          <td><input type='checkbox' /></td>
                          <td>{$product['id_p']}</td>
                          <td>{$product['product_name']}</td>
                          <td>{$product['model']}</td>
                          <td>{$product['category_name']}</td>
                          <td>{$product['location']}</td>
                          <td>{$product['observations']}</td>
                          <td>{$product['fk_user']}</td>
                        </tr>";
                }
              } else {
                echo "<tr><td colspan='8'>No hay productos en el inventario.</td></tr>";
              }
            ?>
          </tbody>
        </table>
      </div>
    </main>
  </div>

  <!-- Modal de Filtros -->
  <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="filterModalLabel">Seleccionar Filtros</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <form id="filterForm">
            <select class="form-select mb-3" id="filterEtiquetado">
              <option selected>Etiquetado</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
            <select class="form-select mb-3" id="filterStatus">
              <option selected>Status</option>
              <option value="bueno">Bueno</option>
              <option value="danado">Dañado</option>
            </select>
            <select class="form-select mb-3" id="filterTipo">
              <option selected>Tipo</option>
              <option value="cons">Cons</option>
              <option value="cont">Cont</option>
            </select>
            <select class="form-select mb-3" id="filterEdificio">
              <option selected>Edificio</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
            </select>
            <select class="form-select mb-3" id="filterArea">
              <option selected>Área</option>
              <option value="sala_maestros">Sala de maestros</option>
              <option value="aula">Aula</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="bodega">Bodega</option>
            </select>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-primary" id="applyFilters">Aplicar Filtros</button>
        </div>
      </div>
    </div>
  </div>

  <!-- JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="../js/script.js"></script>  <!-- Ruta ajustada -->
  <script src="../js/logout.js"></script>  <!-- Ruta ajustada -->
  <script src="../js/index.js"></script>  <!-- Ruta ajustada -->
  <script src="../js/buscador.js"></script>  <!-- Ruta ajustada -->
  <script src="../js/apartado.js"></script>  <!-- Ruta ajustada -->
</body>
</html>
