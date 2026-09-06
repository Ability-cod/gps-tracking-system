<?php
// backend/index.php

// Allow frontend domain (Vercel) to access backend (Railway)
$allowedOrigin = $_ENV['CLIENT_URL'] ?? getenv('CLIENT_URL') ?: 'http://localhost:5173';

header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle browser preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/routes/api.php';