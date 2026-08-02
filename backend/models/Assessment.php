<?php
// backend/models/Assessment.php
// Shughuli za assessments
 
require_once __DIR__ . '/../config/database.php'; 
class Assessment {
    private $db;
 
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
 
    // Fanya assessment au sasisha
    public function upsert($supervisorId, $studentId, $status, $note = '') {
        $sql = "INSERT INTO assessments (supervisor_id, student_id, status, note, assessed_at)
                VALUES (:supervisor_id, :student_id, :status, :note, 
                        CASE WHEN :status2 = 'assessed' THEN NOW() ELSE NULL END)
                ON CONFLICT (student_id)
                DO UPDATE SET
                    supervisor_id = EXCLUDED.supervisor_id,
                    status        = EXCLUDED.status,
                    note          = EXCLUDED.note,
                    assessed_at   = CASE WHEN EXCLUDED.status = 'assessed' THEN NOW() ELSE NULL END
                RETURNING *";
 
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':supervisor_id' => $supervisorId,
            ':student_id'    => $studentId,
            ':status'        => $status,
            ':note'          => trim($note),
            ':status2'       => $status,
        ]);
        return $stmt->fetch();
    }
 
    // Pata assessment ya student
    public function getByStudentId($studentId) {
        $sql = "SELECT * FROM assessments WHERE student_id = :student_id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
        $result = $stmt->fetch();
        // Kama haipo, rudisha default
        return $result ?: ['student_id' => $studentId, 'status' => 'not_assessed', 'note' => ''];
    }
 
    // Pata assessments za students wote wa supervisor
    public function getBySupervisorId($supervisorId) {
        $sql = "SELECT a.*, u.name as student_name, u.email as student_email
                FROM assessments a
                JOIN users u ON a.student_id = u.id
                WHERE a.supervisor_id = :supervisor_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':supervisor_id' => $supervisorId]);
        return $stmt->fetchAll();
    }
}
?>