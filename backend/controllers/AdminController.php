<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Assessment.php';
require_once __DIR__ . '/../models/VisitLog.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminController {

    private function requireAdmin($authUser) {
        if ($authUser['role'] !== 'admin') {
            Response::error('Access denied. Admin only.', 403);
        }
    }

    // GET /admin/stats
    public function getStats($authUser) {
        $this->requireAdmin($authUser);
        $db = \Database::getInstance()->getConnection();

        $totalUsers       = $db->query("SELECT COUNT(*) FROM users WHERE role != 'admin'")->fetchColumn();
        $totalSupervisors = $db->query("SELECT COUNT(*) FROM users WHERE role = 'supervisor'")->fetchColumn();
        $totalStudents    = $db->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
        $totalAssessed    = $db->query("SELECT COUNT(*) FROM assessments WHERE status = 'assessed'")->fetchColumn();
        $totalVisits      = $db->query("SELECT COUNT(*) FROM visit_logs")->fetchColumn();
        $activeLocations  = $db->query("SELECT COUNT(*) FROM locations WHERE is_sharing = TRUE")->fetchColumn();

        $recentUsers = $db->query(
            "SELECT id, name, email, role, phone, created_at
             FROM users
             WHERE role != 'admin'
             AND created_at >= NOW() - INTERVAL '7 days'
             ORDER BY created_at DESC"
        )->fetchAll();

        Response::success([
            'total_users'       => (int) $totalUsers,
            'total_supervisors' => (int) $totalSupervisors,
            'total_students'    => (int) $totalStudents,
            'total_assessed'    => (int) $totalAssessed,
            'total_visits'      => (int) $totalVisits,
            'active_locations'  => (int) $activeLocations,
            'recent_users'      => $recentUsers,
        ]);
    }

    // GET /admin/users
    public function getAllUsers($authUser) {
        $this->requireAdmin($authUser);
        $db = \Database::getInstance()->getConnection();

        $sql = "SELECT
                    u.id, u.name, u.email, u.role, u.phone,
                    u.supervisor_id, u.created_at,
                    s.name  AS supervisor_name,
                    s.email AS supervisor_email,
                    s.phone AS supervisor_phone,
                    (SELECT COUNT(*) FROM visit_logs vl WHERE vl.student_id = u.id) AS visit_count,
                    a.status AS assessment_status
                FROM users u
                LEFT JOIN users s ON u.supervisor_id = s.id
                LEFT JOIN assessments a ON a.student_id = u.id
                WHERE u.role != 'admin'
                ORDER BY u.role ASC, u.name ASC";

        $users = $db->query($sql)->fetchAll();
        Response::success($users);
    }

    // GET /admin/supervisors
    public function getSupervisors($authUser) {
        $this->requireAdmin($authUser);
        $db   = \Database::getInstance()->getConnection();
        $data = $db->query(
            "SELECT id, name, email, phone FROM users WHERE role = 'supervisor' ORDER BY name ASC"
        )->fetchAll();
        Response::success($data);
    }

    // POST /admin/users — add user with phone
    public function addUser($authUser) {
        $this->requireAdmin($authUser);

        $body         = json_decode(file_get_contents('php://input'), true);
        $name         = trim($body['name']          ?? '');
        $email        = strtolower(trim($body['email'] ?? ''));
        $password     = $body['password']            ?? '';
        $role         = $body['role']                ?? '';
        $phone        = trim($body['phone']          ?? '');
        $supervisorId = $body['supervisor_id']       ?? null;

        if (!$name || !$email || !$password || !$role) {
            Response::error('Name, email, password and role are required.');
        }
        if (!in_array($role, ['student', 'supervisor'])) {
            Response::error('Role must be student or supervisor.');
        }
        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format.');
        }
        if ($role === 'student' && !$supervisorId) {
            Response::error('A supervisor must be assigned to each student.');
        }

        $userModel = new User();
        if ($userModel->emailExists($email)) {
            Response::error('This email is already registered.');
        }

        $user = $userModel->create(
            $name, $email, $password, $role,
            $supervisorId ?: null,
            $phone ?: null
        );

        unset($user['password']);
        Response::success($user, "User '{$name}' added successfully.", 201);
    }

    // DELETE /admin/users/{id}
    public function deleteUser($authUser, $userId) {
        $this->requireAdmin($authUser);

        $userModel = new User();
        $user      = $userModel->findById($userId);
        if (!$user) Response::notFound('User not found.');
        if ($user['role'] === 'admin') Response::error('Cannot delete admin account.', 403);

        $db   = \Database::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM users WHERE id = :id AND role != 'admin'");
        $stmt->execute([':id' => $userId]);

        if ($stmt->rowCount() === 0) Response::error('Failed to delete user.');
        Response::success(null, "User '{$user['name']}' deleted.");
    }

    // PUT /admin/users/{id}/password
    public function resetPassword($authUser, $userId) {
        $this->requireAdmin($authUser);

        $body        = json_decode(file_get_contents('php://input'), true);
        $newPassword = $body['new_password'] ?? '';

        if (!$newPassword || strlen($newPassword) < 6) {
            Response::error('New password must be at least 6 characters.');
        }

        $userModel = new User();
        $user      = $userModel->findById($userId);
        if (!$user) Response::notFound('User not found.');

        $updated = $userModel->updatePassword($userId, $newPassword);
        if (!$updated) Response::serverError('Failed to reset password.');

        Response::success(null, "Password for '{$user['name']}' reset successfully.");
    }

    // PUT /admin/users/{id}
    public function updateUser($authUser, $userId) {
        $this->requireAdmin($authUser);

        $body  = json_decode(file_get_contents('php://input'), true);
        $name  = trim($body['name']  ?? '');
        $phone = trim($body['phone'] ?? '');

        if (!$name || strlen($name) < 2) {
            Response::error('Name must be at least 2 characters.');
        }

        $userModel = new User();
        $user      = $userModel->findById($userId);
        if (!$user) Response::notFound('User not found.');

        // Update name
        $updated = $userModel->updateName($userId, $name);

        // Update phone if provided
        if ($phone) {
            $updated = $userModel->updatePhone($userId, $phone);
        }

        unset($updated['password']);
        Response::success($updated, 'User updated successfully.');
    }
}