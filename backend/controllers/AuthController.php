<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthController {

    // ── LOGIN ONLY — no public register ───────────────────────
    public function login() {
        $body     = json_decode(file_get_contents('php://input'), true);
        $email    = strtolower(trim($body['email']    ?? ''));
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            Response::error('Please enter your email and password.');
        }

        $userModel = new User();
        $user      = $userModel->findByEmail($email);

        if (!$user || !$userModel->verifyPassword($password, $user['password'])) {
            Response::error('Incorrect email or password.', 401);
        }

        $token = JWT::generate([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'name'  => $user['name'],
        ]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'            => $user['id'],
                'name'          => $user['name'],
                'email'         => $user['email'],
                'role'          => $user['role'],
                'phone'         => $user['phone'],
                'supervisor_id' => $user['supervisor_id'],
                'created_at'    => $user['created_at'],
            ],
        ], 'Login successful!');
    }

    // ── GET PROFILE ───────────────────────────────────────────
    public function profile($authUser) {
        $userModel = new User();
        $user      = $userModel->findById($authUser['id']);
        if (!$user) Response::notFound('User not found.');
        unset($user['password']);
        Response::success($user);
    }
}