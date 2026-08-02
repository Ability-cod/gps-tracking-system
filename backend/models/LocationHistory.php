<?php
// backend/models/LocationHistory.php
require_once __DIR__ . '/../config/database.php';

class LocationHistory {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Student anaanza kushare — unda record mpya
    public function startSession($studentId, $latitude, $longitude) {
        // Funga session yoyote iliyowazi kwanza
        $this->closeOpenSession($studentId);

        $sql  = "INSERT INTO location_history (student_id, latitude, longitude, started_at)
                 VALUES (:student_id, :latitude, :longitude, NOW())
                 RETURNING id, started_at";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':student_id' => $studentId,
            ':latitude'   => $latitude,
            ':longitude'  => $longitude,
        ]);
        return $stmt->fetch();
    }

    // Student anasimamisha kushare — funga session
    public function endSession($studentId) {
        $sql  = "UPDATE location_history
                 SET
                     ended_at         = NOW(),
                     duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
                 WHERE student_id = :student_id
                 AND ended_at IS NULL
                 RETURNING id, started_at, ended_at, duration_minutes";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
        return $stmt->fetch();
    }

    // Funga session zote zilizowazi za student
    private function closeOpenSession($studentId) {
        $sql  = "UPDATE location_history
                 SET
                     ended_at         = NOW(),
                     duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
                 WHERE student_id = :student_id
                 AND ended_at IS NULL";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
    }

    // Pata history ya student mmoja
    public function getByStudentId($studentId, $limit = 30) {
        $sql  = "SELECT
                     lh.id,
                     lh.student_id,
                     lh.latitude,
                     lh.longitude,
                     lh.started_at,
                     lh.ended_at,
                     lh.duration_minutes,
                     u.name  AS student_name,
                     u.email AS student_email,
                     u.phone AS student_phone
                 FROM location_history lh
                 JOIN users u ON lh.student_id = u.id
                 WHERE lh.student_id = :student_id
                 ORDER BY lh.started_at DESC
                 LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':student_id', $studentId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Pata history ya wanafunzi wote wa supervisor
    public function getBySupervisorId($supervisorId, $days = 30) {
        $sql  = "SELECT
                     lh.id,
                     lh.student_id,
                     lh.latitude,
                     lh.longitude,
                     lh.started_at,
                     lh.ended_at,
                     lh.duration_minutes,
                     u.name  AS student_name,
                     u.email AS student_email,
                     u.phone AS student_phone
                 FROM location_history lh
                 JOIN users u ON lh.student_id = u.id
                 WHERE u.supervisor_id = :supervisor_id
                 AND lh.started_at >= NOW() - INTERVAL '{$days} days'
                 ORDER BY lh.started_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':supervisor_id' => $supervisorId]);
        return $stmt->fetchAll();
    }

    // Pata history ya student mmoja kwa supervisor wake
    public function getStudentHistoryForSupervisor($supervisorId, $studentId, $days = 30) {
        $sql  = "SELECT
                     lh.id,
                     lh.student_id,
                     lh.latitude,
                     lh.longitude,
                     lh.started_at,
                     lh.ended_at,
                     lh.duration_minutes,
                     u.name  AS student_name,
                     u.email AS student_email,
                     u.phone AS student_phone
                 FROM location_history lh
                 JOIN users u ON lh.student_id = u.id
                 WHERE u.supervisor_id = :supervisor_id
                 AND lh.student_id = :student_id
                 AND lh.started_at >= NOW() - INTERVAL '{$days} days'
                 ORDER BY lh.started_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':supervisor_id' => $supervisorId,
            ':student_id'    => $studentId,
        ]);
        return $stmt->fetchAll();
    }
}