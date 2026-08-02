<?php
// backend/models/Location.php
// Shughuli za locations za wanafunzi
 
require_once __DIR__ . '/../config/database.php'; 
class Location {
    private $db;
 
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
 
    // Hifadhi au sasisha location ya student
    public function upsert($studentId, $latitude, $longitude, $accuracy) {
        // INSERT kama haipo, UPDATE kama ipo (PostgreSQL ON CONFLICT)
        $sql = "INSERT INTO locations (student_id, latitude, longitude, accuracy, is_sharing, updated_at)
                VALUES (:student_id, :latitude, :longitude, :accuracy, TRUE, NOW())
                ON CONFLICT (student_id)
                DO UPDATE SET
                    latitude   = EXCLUDED.latitude,
                    longitude  = EXCLUDED.longitude,
                    accuracy   = EXCLUDED.accuracy,
                    is_sharing = TRUE,
                    updated_at = NOW()
                RETURNING *";
 
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':student_id' => $studentId,
            ':latitude'   => $latitude,
            ':longitude'  => $longitude,
            ':accuracy'   => $accuracy,
        ]);
        return $stmt->fetch();
    }
 
    // Futa location (student amesimamisha kushare)
    public function delete($studentId) {
        $sql = "DELETE FROM locations WHERE student_id = :student_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
        return $stmt->rowCount() > 0;
    }
 
    // Pata location ya student mmoja
    public function getByStudentId($studentId) {
        $sql = "SELECT l.*, u.name as student_name, u.email as student_email
                FROM locations l
                JOIN users u ON l.student_id = u.id
                WHERE l.student_id = :student_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
        return $stmt->fetch();
    }
 
    // Pata locations za students wote wa supervisor
    public function getStudentsLocations($supervisorId) {
        $sql = "SELECT l.*, u.name as student_name, u.email as student_email
                FROM locations l
                JOIN users u ON l.student_id = u.id
                WHERE u.supervisor_id = :supervisor_id
                AND l.is_sharing = TRUE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':supervisor_id' => $supervisorId]);
        return $stmt->fetchAll();
    }
}
?>
 