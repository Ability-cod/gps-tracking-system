<?php
// backend/controllers/VisitLogController.php
 
require_once __DIR__ . '/../models/VisitLog.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
class VisitLogController {
 
    // Supervisor — ongeza ziara mpya
    public function create($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors tu wanaweza kurekodi ziara.', 403);
        }
 
        $body         = json_decode(file_get_contents('php://input'), true);
        $studentId    = $body['student_id']    ?? null;
        $note         = $body['note']          ?? '';
        $locationName = $body['location_name'] ?? '';
 
        if (!$studentId || !trim($note)) {
            Response::error('student_id na note vinahitajika.');
        }
 
        // Hakikisha student ni wake
        $userModel = new User();
        $student   = $userModel->findById($studentId);
 
        if (!$student || $student['supervisor_id'] != $authUser['id']) {
            Response::error('Mwanafunzi huyu si wako.', 403);
        }
 
        $visitLogModel = new VisitLog();
        $log = $visitLogModel->create(
            $authUser['id'],
            $authUser['name'],
            $studentId,
            $student['name'],
            $note,
            $locationName
        );
 
        Response::success($log, 'Ziara imerekodiwa vizuri!', 201);
    }
 
    // Student — pata ziara zake
    public function getMyVisits($authUser) {
        if ($authUser['role'] !== 'student') {
            Response::error('Students tu.', 403);
        }
 
        $visitLogModel = new VisitLog();
        $logs = $visitLogModel->getByStudentId($authUser['id']);
 
        Response::success($logs);
    }
 
    // Supervisor — pata ziara zake zote
    public function getMySupervisorVisits($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors tu.', 403);
        }
 
        $visitLogModel = new VisitLog();
        $logs = $visitLogModel->getBySupervisorId($authUser['id']);
 
        Response::success($logs);
    }
}
?>