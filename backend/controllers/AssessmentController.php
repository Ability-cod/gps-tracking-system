<?php
// backend/controllers/AssessmentController.php
 
require_once __DIR__ . '/../models/Assessment.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
class AssessmentController {
 
    // Supervisor — fanya au sasisha assessment
    public function upsert($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors tu wanaweza kufanya assessment.', 403);
        }
 
        $body      = json_decode(file_get_contents('php://input'), true);
        $studentId = $body['student_id'] ?? null;
        $status    = $body['status']     ?? '';
        $note      = $body['note']       ?? '';
 
        if (!$studentId || !$status) {
            Response::error('student_id na status vinahitajika.');
        }
 
        if (!in_array($status, ['assessed', 'not_assessed'])) {
            Response::error('Status lazima iwe assessed au not_assessed.');
        }
 
        // Hakikisha student ni wake
        $userModel = new User();
        $student   = $userModel->findById($studentId);
 
        if (!$student || $student['supervisor_id'] != $authUser['id']) {
            Response::error('Mwanafunzi huyu si wako.', 403);
        }
 
        $assessmentModel = new Assessment();
        $assessment = $assessmentModel->upsert($authUser['id'], $studentId, $status, $note);
 
        Response::success($assessment, 'Assessment imehifadhiwa.');
    }
 
    // Pata assessment ya student (student au supervisor)
    public function getByStudent($authUser, $studentId) {
        $assessmentModel = new Assessment();
        $assessment = $assessmentModel->getByStudentId($studentId);
 
        // Student anaona yake tu
        if ($authUser['role'] === 'student' && $authUser['id'] != $studentId) {
            Response::error('Unaweza kuona assessment yako tu.', 403);
        }
 
        Response::success($assessment);
    }
 
    // Supervisor — pata assessments za students wake wote
    public function getMySupervisorAssessments($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors tu.', 403);
        }
 
        $assessmentModel = new Assessment();
        $assessments = $assessmentModel->getBySupervisorId($authUser['id']);
 
        Response::success($assessments);
    }
}
 ?>