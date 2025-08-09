-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-07-2025 a las 15:10:03
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `crossapp`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actions`
--

CREATE TABLE `actions` (
  `id_act` int(11) NOT NULL,
  `act` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `borrowed`
--

CREATE TABLE `borrowed` (
  `id_borrow` int(11) NOT NULL,
  `fk_inv` int(11) DEFAULT NULL,
  `fk_user` int(11) DEFAULT NULL,
  `borrow_d` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `brand`
--

CREATE TABLE `brand` (
  `id_brand` int(11) NOT NULL,
  `b_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `brand`
--

INSERT INTO `brand` (`id_brand`, `b_name`) VALUES
(1, 'HP'),
(2, 'Lenovo'),
(3, 'Dell'),
(4, 'Samsung'),
(5, 'Acer'),
(16, 'HP'),
(17, 'Lenovo'),
(18, 'Dell'),
(19, 'Samsung'),
(20, 'Acer');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `category`
--

CREATE TABLE `category` (
  `id_category` int(11) NOT NULL,
  `c_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `category`
--

INSERT INTO `category` (`id_category`, `c_name`) VALUES
(1, 'material'),
(2, 'insumo'),
(3, 'equipo'),
(4, 'laboratorio'),
(5, 'talleres');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disabled`
--

CREATE TABLE `disabled` (
  `id_disable` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `desactivado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `history`
--

CREATE TABLE `history` (
  `id_history` int(11) NOT NULL,
  `fk_inv` int(11) DEFAULT NULL,
  `fk_action` int(11) DEFAULT NULL,
  `fk_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory`
--

CREATE TABLE `inventory` (
  `id_p` int(11) NOT NULL,
  `lab_name` varchar(255) DEFAULT NULL,
  `fk_category` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `fk_brand` int(11) DEFAULT NULL,
  `fk_producer` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `n_series` varchar(255) DEFAULT NULL,
  `specs` text DEFAULT NULL,
  `picture` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `observations` text DEFAULT NULL,
  `fk_user` int(11) DEFAULT NULL,
  `fk_disabled` int(11) DEFAULT NULL,
  `fk_pending` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory`
--

INSERT INTO `inventory` (`id_p`, `lab_name`, `fk_category`, `name`, `quantity`, `description`, `model`, `fk_brand`, `fk_producer`, `code`, `n_series`, `specs`, `picture`, `location`, `observations`, `fk_user`, `fk_disabled`, `fk_pending`) VALUES
(1, 'Laboratorio A', 1, 'Laptop', 10, 'Laptop portátil para estudiantes y profesores', 'XPS 13', 1, NULL, NULL, NULL, NULL, NULL, 'A', 'Producto en excelente estado', 12, NULL, NULL),
(2, 'Laboratorio B', 1, 'Monitor', 5, 'Monitor 24 pulgadas Full HD', 'U2419H', 2, NULL, NULL, NULL, NULL, NULL, 'A', 'Ideal para tareas de diseño gráfico', 13, NULL, NULL),
(3, 'Laboratorio C', 1, 'Teclado', 15, 'Teclado mecánico para uso profesional', 'K120', 3, NULL, NULL, NULL, NULL, NULL, 'B', 'Conexión USB, ergonomía avanzada', 14, NULL, NULL),
(4, 'Pasillo 1', 2, 'Proyector', 3, 'Proyector para aulas y conferencias', 'PJD7828HDL', 4, NULL, NULL, NULL, NULL, NULL, 'A', 'Con resolución 1080p', 15, NULL, NULL),
(5, 'Pasillo 2', 3, 'CPU', 8, 'CPU de escritorio', 'Optiplex 7080', 5, NULL, NULL, NULL, NULL, NULL, 'C', 'Adecuado para uso de oficina', 16, NULL, NULL),
(6, 'Laboratorio D', 1, 'Router', 20, 'Router para red de oficina', 'Archer A7', 1, NULL, NULL, NULL, NULL, NULL, 'A', 'Conexión Wi-Fi de alta velocidad', 17, NULL, NULL),
(7, 'Laboratorio A', 1, 'Laptop', 10, 'Laptop portátil para estudiantes y profesores', 'XPS 13', 1, NULL, NULL, NULL, NULL, NULL, 'A', 'Producto en excelente estado', 12, NULL, NULL),
(8, 'Laboratorio B', 1, 'Monitor', 5, 'Monitor 24 pulgadas Full HD', 'U2419H', 2, NULL, NULL, NULL, NULL, NULL, 'A', 'Ideal para tareas de diseño gráfico', 13, NULL, NULL),
(9, 'Laboratorio C', 1, 'Teclado', 15, 'Teclado mecánico para uso profesional', 'K120', 3, NULL, NULL, NULL, NULL, NULL, 'B', 'Conexión USB, ergonomía avanzada', 14, NULL, NULL),
(10, 'Pasillo 1', 2, 'Proyector', 3, 'Proyector para aulas y conferencias', 'PJD7828HDL', 4, NULL, NULL, NULL, NULL, NULL, 'A', 'Con resolución 1080p', 15, NULL, NULL),
(11, 'Pasillo 2', 3, 'CPU', 8, 'CPU de escritorio', 'Optiplex 7080', 5, NULL, NULL, NULL, NULL, NULL, 'C', 'Adecuado para uso de oficina', 16, NULL, NULL),
(12, 'Laboratorio D', 1, 'Router', 20, 'Router para red de oficina', 'Archer A7', 1, NULL, NULL, NULL, NULL, NULL, 'A', 'Conexión Wi-Fi de alta velocidad', 17, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pending`
--

CREATE TABLE `pending` (
  `id_pending` int(11) NOT NULL,
  `pendiente` tinyint(1) DEFAULT 0,
  `completado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rols`
--

CREATE TABLE `rols` (
  `id_rol` int(11) NOT NULL,
  `rol` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rols`
--

INSERT INTO `rols` (`id_rol`, `rol`) VALUES
(1, 'master'),
(2, 'administrador'),
(3, 'administrador'),
(4, 'profesor'),
(5, 'profesor'),
(6, 'profesor'),
(7, 'alumno'),
(8, 'alumno'),
(9, 'alumno'),
(10, 'alumno'),
(11, 'alumno');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fk_rol` int(11) DEFAULT NULL,
  `matricula` char(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_user`, `name`, `email`, `password`, `fk_rol`, `matricula`) VALUES
(12, 'Master User', 'master@domain.com', 'password123', 1, '1234567890'),
(13, 'Admin User 1', 'admin1@domain.com', 'password123', 2, '1234567891'),
(14, 'Admin User 2', 'admin2@domain.com', 'password123', 2, '1234567892'),
(15, 'Professor 1', 'prof1@domain.com', 'password123', 3, '1234567893'),
(16, 'Professor 2', 'prof2@domain.com', 'password123', 3, '1234567894'),
(17, 'Professor 3', 'prof3@domain.com', 'password123', 3, '1234567895'),
(18, 'Alumno 1', 'alumno1@domain.com', 'password123', 4, '1234567896'),
(19, 'Alumno 2', 'alumno2@domain.com', 'password123', 4, '1234567897'),
(20, 'Alumno 3', 'alumno3@domain.com', 'password123', 4, '1234567898'),
(21, 'Alumno 4', 'alumno4@domain.com', 'password123', 4, '1234567899'),
(22, 'Alumno 5', 'alumno5@domain.com', 'password123', 4, '1234567800');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`id_act`);

--
-- Indices de la tabla `borrowed`
--
ALTER TABLE `borrowed`
  ADD PRIMARY KEY (`id_borrow`),
  ADD KEY `fk_user` (`fk_user`),
  ADD KEY `fk_borrowed_inventory` (`fk_inv`);

--
-- Indices de la tabla `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`id_brand`);

--
-- Indices de la tabla `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id_category`);

--
-- Indices de la tabla `disabled`
--
ALTER TABLE `disabled`
  ADD PRIMARY KEY (`id_disable`);

--
-- Indices de la tabla `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id_history`),
  ADD KEY `fk_inv` (`fk_inv`),
  ADD KEY `fk_action` (`fk_action`),
  ADD KEY `fk_user` (`fk_user`);

--
-- Indices de la tabla `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id_p`),
  ADD KEY `fk_category` (`fk_category`),
  ADD KEY `fk_brand` (`fk_brand`),
  ADD KEY `fk_producer` (`fk_producer`),
  ADD KEY `fk_inventory_user` (`fk_user`),
  ADD KEY `fk_inventory_pending` (`fk_pending`),
  ADD KEY `fk_inventory_disabled` (`fk_disabled`);

--
-- Indices de la tabla `pending`
--
ALTER TABLE `pending`
  ADD PRIMARY KEY (`id_pending`);

--
-- Indices de la tabla `rols`
--
ALTER TABLE `rols`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `matricula` (`matricula`),
  ADD KEY `fk_rol` (`fk_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actions`
--
ALTER TABLE `actions`
  MODIFY `id_act` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `borrowed`
--
ALTER TABLE `borrowed`
  MODIFY `id_borrow` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `brand`
--
ALTER TABLE `brand`
  MODIFY `id_brand` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `category`
--
ALTER TABLE `category`
  MODIFY `id_category` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `disabled`
--
ALTER TABLE `disabled`
  MODIFY `id_disable` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `history`
--
ALTER TABLE `history`
  MODIFY `id_history` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id_p` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `pending`
--
ALTER TABLE `pending`
  MODIFY `id_pending` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rols`
--
ALTER TABLE `rols`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `borrowed`
--
ALTER TABLE `borrowed`
  ADD CONSTRAINT `borrowed_ibfk_1` FOREIGN KEY (`fk_user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `fk_borrowed_inventory` FOREIGN KEY (`fk_inv`) REFERENCES `inventory` (`id_p`);

--
-- Filtros para la tabla `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`fk_inv`) REFERENCES `inventory` (`id_p`),
  ADD CONSTRAINT `history_ibfk_2` FOREIGN KEY (`fk_action`) REFERENCES `actions` (`id_act`),
  ADD CONSTRAINT `history_ibfk_3` FOREIGN KEY (`fk_user`) REFERENCES `users` (`id_user`);

--
-- Filtros para la tabla `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `fk_inventory_disabled` FOREIGN KEY (`fk_disabled`) REFERENCES `disabled` (`id_disable`),
  ADD CONSTRAINT `fk_inventory_pending` FOREIGN KEY (`fk_pending`) REFERENCES `pending` (`id_pending`),
  ADD CONSTRAINT `fk_inventory_user` FOREIGN KEY (`fk_user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`fk_category`) REFERENCES `category` (`id_category`),
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`fk_brand`) REFERENCES `brand` (`id_brand`),
  ADD CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`fk_producer`) REFERENCES `producer` (`id_producer`);

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `rols` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
