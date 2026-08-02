<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($name, $email, $password, $role, $supervisorId = null, $phone = null) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $sql = "INSERT INTO users (name, email, password, role, supervisor_id, phone)
                VALUES (:name, :email, :password, :role, :supervisor_id, :phone)
                RETURNING id, name, email, role, supervisor_id, phone, created_at";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name'          => trim($name),
            ':email'         => strtolower(trim($email)),
            ':password'      => $hashedPassword,
            ':role'          => $role,
            ':supervisor_id' => $supervisorId,
            ':phone'         => $phone ? trim($phone) : null,
        ]);
        return $stmt->fetch();
    }

    public function findByEmail($email) {
        $sql  = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => strtolower(trim($email))]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $sql  = "SELECT id, name, email, role, supervisor_id, phone, password, created_at
                 FROM users WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function getStudentsBySupervisor($supervisorId) {
        $sql  = "SELECT id, name, email, role, supervisor_id, phone, created_at
                 FROM users
                 WHERE role = 'student' AND supervisor_id = :supervisor_id
                 ORDER BY name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':supervisor_id' => $supervisorId]);
        return $stmt->fetchAll();
    }

    public function emailExists($email) {
        $sql  = "SELECT id FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => strtolower(trim($email))]);
        return $stmt->fetch() !== false;
    }

    public function verifyPassword($password, $hashedPassword) {
        return password_verify($password, $hashedPassword);
    }

    public function updateName($id, $name) {
        $sql  = "UPDATE users SET name = :name WHERE id = :id
                 RETURNING id, name, email, role, supervisor_id, phone, created_at";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':name' => trim($name), ':id' => $id]);
        return $stmt->fetch();
    }

    public function updatePhone($id, $phone) {
        $sql  = "UPDATE users SET phone = :phone WHERE id = :id
                 RETURNING id, name, email, role, supervisor_id, phone, created_at";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':phone' => trim($phone), ':id' => $id]);
        return $stmt->fetch();
    }

    public function updatePassword($id, $newPassword) {
        $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $sql    = "UPDATE users SET password = :password WHERE id = :id";
        $stmt   = $this->db->prepare($sql);
        $stmt->execute([':password' => $hashed, ':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}