<?php
// backend/controllers/LocationHistoryController.php
require_once __DIR__ . '/../models/LocationHistory.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';

class LocationHistoryController {

    // GET /location-history — supervisor anapata history ya wanafunzi wake wote
    public function getAll($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors only.', 403);
        }

        $days    = isset($_GET['days']) ? (int) $_GET['days'] : 30;
        $model   = new LocationHistory();
        $history = $model->getBySupervisorId($authUser['id'], $days);

        Response::success($history);
    }

    // GET /location-history/{studentId} — history ya student mmoja
    public function getByStudent($authUser, $studentId) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors only.', 403);
        }

        // Hakikisha student ni wake
        $userModel = new User();
        $student   = $userModel->findById($studentId);

        if (!$student || $student['supervisor_id'] != $authUser['id']) {
            Response::error('This student is not assigned to you.', 403);
        }

        $days    = isset($_GET['days']) ? (int) $_GET['days'] : 30;
        $model   = new LocationHistory();
        $history = $model->getStudentHistoryForSupervisor(
            $authUser['id'], $studentId, $days
        );

        Response::success([
            'student' => [
                'id'    => $student['id'],
                'name'  => $student['name'],
                'email' => $student['email'],
                'phone' => $student['phone'],
            ],
            'history' => $history,
            'total'   => count($history),
        ]);
    }
}