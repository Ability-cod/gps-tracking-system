<?php
// backend/models/VisitLog.php
// Shughuli za visit logs
 
require_once __DIR__ . '/../config/database.php'; 
class VisitLog {
    private $db;
 
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
 
    // Ongeza ziara mpya
    public function create($supervisorId, $supervisorName, $studentId, $studentName, $note, $locationName = '') {
        $sql = "INSERT INTO visit_logs (supervisor_id, supervisor_name, student_id, student_name, note, location_name)
                VALUES (:supervisor_id, :supervisor_name, :student_id, :student_name, :note, :location_name)
                RETURNING *";
 
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':supervisor_id'   => $supervisorId,
            ':supervisor_name' => $supervisorName,
            ':student_id'      => $studentId,
            ':student_name'    => $studentName,
            ':note'            => trim($note),
            ':location_name'   => trim($locationName),
        ]);
        return $stmt->fetch();
    }
 
    // Pata ziara za student mmoja (kwa student kuona)
    public function getByStudentId($studentId) {
        $sql = "SELECT * FROM visit_logs
                WHERE student_id = :student_id
                ORDER BY visited_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
        return $stmt->fetchAll();
    }
 
    // Pata ziara zote za supervisor (kwa supervisor kuona)
    public function getBySupervisorId($supervisorId) {
        $sql = "SELECT * FROM visit_logs
                WHERE supervisor_id = :supervisor_id
                ORDER BY visited_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':supervisor_id' => $supervisorId]);
        return $stmt->fetchAll();
    }
}
?>