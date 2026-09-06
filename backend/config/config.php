<?php
// backend/config/config.php
// Uses environment variables for production (Railway)
// Falls back to local values for development (XAMPP)

define('DB_HOST',     $_ENV['DB_HOST']     ?? getenv('DB_HOST')     ?: 'localhost');
define('DB_PORT',     $_ENV['DB_PORT']     ?? getenv('DB_PORT')     ?: '5432');
define('DB_NAME',     $_ENV['DB_NAME']     ?? getenv('DB_NAME')     ?: 'mzumbe_gps');
define('DB_USER',     $_ENV['DB_USER']     ?? getenv('DB_USER')     ?: 'postgres');
define('DB_PASSWORD', $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '44RW%!v3ca+GfE+');
define('JWT_SECRET',  $_ENV['JWT_SECRET']  ?? getenv('JWT_SECRET')  ?: 'mzumbe_secret_2026');
define('JWT_EXPIRY',  (int)($_ENV['JWT_EXPIRY'] ?? getenv('JWT_EXPIRY') ?: 604800));
define('CLIENT_URL',  $_ENV['CLIENT_URL']  ?? getenv('CLIENT_URL')  ?: 'http://localhost:5173');