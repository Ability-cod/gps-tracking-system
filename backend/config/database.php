<?php
// backend/config/database.php
// Reads directly from environment variables — no config.php needed on server

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        // Read from environment variables (Render) or fallback to local values
        $host     = $_ENV['DB_HOST']     ?? getenv('DB_HOST')     ?: 'localhost';
        $port     = $_ENV['DB_PORT']     ?? getenv('DB_PORT')     ?: '5432';
        $name     = $_ENV['DB_NAME']     ?? getenv('DB_NAME')     ?: 'mzumbe_gps';
        $user     = $_ENV['DB_USER']     ?? getenv('DB_USER')     ?: 'postgres';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: 'your_local_password';

        $dsn = "pgsql:host={$host};port={$port};dbname={$name}";

        try {
            $this->connection = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ]);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}