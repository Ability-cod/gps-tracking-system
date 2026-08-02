<?php
try {
    $pdo = new PDO(
        "pgsql:host=localhost;port=5432;dbname=mzumbe_gps",
        "postgres",
        "ability"  // ← weka password yako ya pgAdmin
    );
    echo json_encode([
        'status'   => 'SUCCESS ✅',
        'message'  => 'Database imeunganika vizuri!',
        'database' => 'mzumbe_gps'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'FAILED ❌',
        'message' => $e->getMessage()
    ]);
}