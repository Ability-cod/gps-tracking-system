<?php
// backend/config/config.php

define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'mzumbe_gps');
define('DB_USER', 'postgres');
define('DB_PASSWORD', 'ability');

define('JWT_SECRET', 'mzumbe_gps_super_secret_key_2026');
define('JWT_EXPIRY', 604800); // Siku 7

define('CLIENT_URL', 'http://localhost:5173');