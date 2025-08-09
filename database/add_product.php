<?php
// Incluir archivo de conexión a la base de datos
include('db.php');

// Obtener laboratorios y ubicaciones
$sql_laboratorios = "SELECT * FROM laboratorios";
$laboratorios_result = $conn->query($sql_laboratorios);

$sql_ubicaciones = "SELECT * FROM ubicaciones";
$ubicaciones_result = $conn->query($sql_ubicaciones);

// Verificar si el formulario ha sido enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $fk_laboratorio = $_POST['fk_laboratorio'];
    $fk_ubicacion = $_POST['fk_ubicacion'];
    $fk_category = $_POST['fk_category'];
    $name = $_POST['name'];
    $quantity = $_POST['quantity'];
    $description = $_POST['description'];
    $model = $_POST['model'];
    $fk_brand = $_POST['fk_brand'];
    $code = $_POST['code']; // Asegúrate de que se genere un código único
    $n_series = $_POST['n_series']; // Generar un número de serie único
    $specs = $_POST['specs'];
    $picture = $_POST['picture'];
    $observations = $_POST['observations'];

    // Preparar la consulta para insertar el nuevo producto
    $sql = "
        INSERT INTO inventory 
        (fk_laboratorio, fk_ubicacion, fk_category, name, quantity, description, model, fk_brand, code, n_series, specs, picture, observations)
        VALUES 
        ('$fk_laboratorio', '$fk_ubicacion', '$fk_category', '$name', '$quantity', '$description', '$model', '$fk_brand', '$code', '$n_series', '$specs', '$picture', '$observations')
    ";

    if ($conn->query($sql) === TRUE) {
        echo "Nuevo producto agregado correctamente.";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    // Cerrar la conexión
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agregar Producto</title>
    <link href="../css/bootstrap.min.css" rel="stylesheet" />
</head>
<body>
    <div class="container mt-5">
        <h1>Agregar Nuevo Producto</h1>
        <form method="POST" action="add_product.php">
            <div class="form-group">
                <label for="fk_laboratorio">Laboratorio</label>
                <select class="form-control" id="fk_laboratorio" name="fk_laboratorio" required>
                    <?php
                    while ($lab = $laboratorios_result->fetch_assoc()) {
                        echo "<option value='{$lab['id_laboratorio']}'>{$lab['nombre_laboratorio']}</option>";
                    }
                    ?>
                </select>
            </div>

            <div class="form-group">
                <label for="fk_ubicacion">Ubicación</label>
                <select class="form-control" id="fk_ubicacion" name="fk_ubicacion" required>
                    <?php
                    while ($ub = $ubicaciones_result->fetch_assoc()) {
                        echo "<option value='{$ub['id_ubicacion']}'>{$ub['nombre_ubicacion']}</option>";
                    }
                    ?>
                </select>
            </div>

            <!-- Los demás campos son iguales a los anteriores -->
            <div class="form-group">
                <label for="name">Nombre del Producto</label>
                <input type="text" class="form-control" id="name" name="name" required>
            </div>

            <div class="form-group">
                <label for="quantity">Cantidad</label>
                <input type="number" class="form-control" id="quantity" name="quantity" required>
            </div>

            <div class="form-group">
                <label for="description">Descripción</label>
                <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
            </div>

            <div class="form-group">
                <label for="model">Modelo</label>
                <input type="text" class="form-control" id="model" name="model" required>
            </div>

            <div class="form-group">
                <label for="fk_brand">Marca</label>
                <select class="form-control" id="fk_brand" name="fk_brand" required>
                    <option value="1">HP</option>
                    <option value="2">Lenovo</option>
                    <option value="3">Dell</option>
                    <option value="4">Samsung</option>
                    <option value="5">Acer</option>
                </select>
            </div>

            <div class="form-group">
                <label for="code">Código</label>
                <input type="text" class="form-control" id="code" name="code" required>
            </div>

            <div class="form-group">
                <label for="n_series">Número de Serie</label>
                <input type="text" class="form-control" id="n_series" name="n_series" required>
            </div>

            <div class="form-group">
                <label for="specs">Especificaciones</label>
                <textarea class="form-control" id="specs" name="specs" rows="3" required></textarea>
            </div>

            <div class="form-group">
                <label for="picture">Imagen</label>
                <input type="text" class="form-control" id="picture" name="picture" placeholder="default.jpg" required>
            </div>

            <div class="form-group">
                <label for="observations">Observaciones</label>
                <textarea class="form-control" id="observations" name="observations" rows="3" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary">Agregar Producto</button>
        </form>
    </div>

    <script src="../js/bootstrap.bundle.min.js"></script>
</body>
</html>
