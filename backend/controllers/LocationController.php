<?php
// backend/controllers/LocationController.php
require_once __DIR__ . '/../models/Location.php';
require_once __DIR__ . '/../models/LocationHistory.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';

class LocationController {

    // POST /locations/update — student anatuma location
    public function update($authUser) {
        if ($authUser['role'] !== 'student') {
            Response::error('Students only.', 403);
        }

        $body      = json_decode(file_get_contents('php://input'), true);
        $latitude  = $body['latitude']  ?? null;
        $longitude = $body['longitude'] ?? null;
        $accuracy  = $body['accuracy']  ?? null;
        $isNew     = $body['is_new']    ?? false;

        if ($latitude === null || $longitude === null) {
            Response::error('Latitude and longitude are required.');
        }

        $locationModel = new Location();
        $historyModel  = new LocationHistory();

        $location = $locationModel->upsert($authUser['id'], $latitude, $longitude, $accuracy);

        // Kama ni mara ya kwanza — anza session mpya kwenye history
        if ($isNew) {
            $historyModel->startSession($authUser['id'], $latitude, $longitude);
        }

        Response::success($location, 'Location updated.');
    }

    // DELETE /locations/stop — student anasimamisha
    public function stop($authUser) {
        if ($authUser['role'] !== 'student') {
            Response::error('Students only.', 403);
        }

        $locationModel = new Location();
        $historyModel  = new LocationHistory();

        $historyModel->endSession($authUser['id']);
        $locationModel->delete($authUser['id']);

        Response::success(null, 'Location sharing stopped.');
    }

    // GET /locations/students — supervisor anapata students + locations
    public function getMyStudents($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Supervisors only.', 403);
        }

        $userModel     = new User();
        $locationModel = new Location();

        $students  = $userModel->getStudentsBySupervisor($authUser['id']);
        $locations = $locationModel->getStudentsLocations($authUser['id']);

        $locMap = [];
        foreach ($locations as $loc) {
            $locMap[$loc['student_id']] = $loc;
        }
        foreach ($students as &$student) {
            $student['location'] = $locMap[$student['id']] ?? null;
        }

        Response::success($students);
    }
}