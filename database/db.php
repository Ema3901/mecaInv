<?php
// db.php

$servername = "localhost"; // Si estás usando localhost
$username = "root"; // Tu nombre de usuario de MySQL
$password = ""; // La contraseña de MySQL (en XAMPP, por defecto es vacío)
$dbname = "CrossApp"; // El nombre de tu base de datos

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>
