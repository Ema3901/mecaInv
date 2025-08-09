<?php
// Incluir archivo de conexión a la base de datos
include('db.php');

// Realizar consulta para obtener productos con los nombres de categoría, marca y las unidades
$sql = "
    SELECT 
        inventory.id_p, 
        inventory.lab_name, 
        category.c_name AS category_name, 
        inventory.name AS product_name, 
        inventory.quantity,
        inventory.description,
        inventory.model,
        brand.b_name AS brand_name,
        inventory.code,
        inventory.n_series,
        inventory.specs,
        inventory.picture,
        inventory.location,
        inventory.observations,
        inventory.fk_user,
        inventory.fk_disabled,
        inventory.fk_pending
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

// No cierres la conexión aquí, la dejaremos abierta para la segunda consulta

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Inventario Dashboard</title>
    <link href="../css/bootstrap.min.css" rel="stylesheet" />
</head>
<body>
    <div class="container mt-5">
        <h1>Inventario</h1>
        <a href="add_product.php" class="btn btn-success">Agregar Producto</a>

        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Laboratorio</th>
                    <th>Categoría</th>
                    <th>Nombre del Producto</th>
                    <th>Cantidad</th>
                    <th>Descripción</th>
                    <th>Modelo</th>
                    <th>Marca</th>
                    <th>Código</th>
                    <th>Número de Serie</th>
                    <th>Especificaciones</th>
                    <th>Imagen</th>
                    <th>Ubicación</th>
                    <th>Observaciones</th>
                    <th>Usuario</th>
                    <th>Desactivado</th>
                    <th>Pendiente</th>
                    <th>Unidades</th>
                </tr>
            </thead>
            <tbody>
                <?php
                    // Verificamos si hay productos y los mostramos en la tabla
                    if (count($products) > 0) {
                        foreach ($products as $product) {
                            // Obtener las unidades de cada producto (de la tabla product_units)
                            $sql_units = "
                                SELECT 
                                    serial_number, 
                                    observations, 
                                    status, 
                                    location 
                                FROM 
                                    product_units 
                                WHERE 
                                    fk_inventory = {$product['id_p']}
                            ";
                            $result_units = $conn->query($sql_units);
                            $units = $result_units->fetch_all(MYSQLI_ASSOC);

                            $units_count = count($units); // Número de unidades para este producto

                            // Mostrar el producto
                            echo "<tr>
                                    <td>{$product['id_p']}</td>
                                    <td>{$product['lab_name']}</td>
                                    <td>{$product['category_name']}</td>
                                    <td>{$product['product_name']}</td>
                                    <td>{$product['quantity']}</td>
                                    <td>{$product['description']}</td>
                                    <td>{$product['model']}</td>
                                    <td>{$product['brand_name']}</td>
                                    <td>{$product['code']}</td>
                                    <td>{$product['n_series']}</td>
                                    <td>{$product['specs']}</td>
                                    <td>{$product['picture']}</td>
                                    <td>{$product['location']}</td>
                                    <td>{$product['observations']}</td>
                                    <td>{$product['fk_user']}</td>
                                    <td>{$product['fk_disabled']}</td>
                                    <td>{$product['fk_pending']}</td>
                                    <td>{$units_count}</td> <!-- Mostrar la cantidad de unidades -->
                                  </tr>";

                            // Ahora mostramos las unidades asociadas a este producto
                            foreach ($units as $unit) {
                                echo "<tr>
                                        <td colspan='17' style='background-color: #f2f2f2;'> <!-- Para darle un fondo diferente a las unidades -->
                                            <strong>Unidad Serial: {$unit['serial_number']}</strong><br>
                                            Observaciones: {$unit['observations']}<br>
                                            Estado: {$unit['status']}<br>
                                            Ubicación: {$unit['location']}
                                        </td>
                                      </tr>";
                            }
                        }
                    } else {
                        echo "<tr><td colspan='18'>No hay productos en el inventario.</td></tr>";
                    }
                ?>
            </tbody>
        </table>
    </div>

    <!-- Cerrar la conexión al final del script -->
    <?php $conn->close(); ?>

</body>
</html>
