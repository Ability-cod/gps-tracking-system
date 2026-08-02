<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';

class ProfileController {

    // GET /profile
    public function getProfile($authUser) {
        $userModel = new User();
        $user = $userModel->findById($authUser['id']);
        if (!$user) Response::notFound('User not found.');
        unset($user['password']);
        Response::success($user, 'Profile retrieved successfully.');
    }

    // PUT /profile — update name and phone
    public function updateProfile($authUser) {
        $body  = json_decode(file_get_contents('php://input'), true);
        $name  = trim($body['name']  ?? '');
        $phone = trim($body['phone'] ?? '');

        if (!$name) Response::error('Name is required.');
        if (strlen($name) < 2) Response::error('Name must be at least 2 characters.');

        $userModel = new User();
        $updated   = $userModel->updateName($authUser['id'], $name);

        if ($phone) {
            $updated = $userModel->updatePhone($authUser['id'], $phone);
        }

        if (!$updated) Response::serverError('Failed to update profile.');
        unset($updated['password']);
        Response::success($updated, 'Profile updated successfully.');
    }

    // PUT /profile/password
    public function changePassword($authUser) {
        $body            = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $body['current_password'] ?? '';
        $newPassword     = $body['new_password']     ?? '';
        $confirmPassword = $body['confirm_password'] ?? '';

        if (!$currentPassword || !$newPassword || !$confirmPassword) {
            Response::error('All password fields are required.');
        }
        if (strlen($newPassword) < 6) {
            Response::error('New password must be at least 6 characters.');
        }
        if ($newPassword !== $confirmPassword) {
            Response::error('New password and confirm password do not match.');
        }

        $userModel = new User();
        $user      = $userModel->findById($authUser['id']);

        if (!$userModel->verifyPassword($currentPassword, $user['password'])) {
            Response::error('Current password is incorrect.', 401);
        }

        $updated = $userModel->updatePassword($authUser['id'], $newPassword);
        if (!$updated) Response::serverError('Failed to update password.');

        Response::success(null, 'Password changed successfully.');
    }
}