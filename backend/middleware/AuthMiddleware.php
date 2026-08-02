<?php
// backend/middleware/AuthMiddleware.php
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {

    // Kagua token na rudisha user data
    public static function authenticate() {
        // Pata Authorization header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        // Kagua kama header ipo
        if (empty($authHeader)) {
            Response::unauthorized('Hakuna token. Tafadhali login kwanza.');
        }

        // Header lazima ianze na "Bearer "
        if (!str_starts_with($authHeader, 'Bearer ')) {
            Response::unauthorized('Muundo wa token si sahihi.');
        }

        // Toa token — ondoa "Bearer " mwanzo
        $token = substr($authHeader, 7);

        // Kagua token
        $decoded = JWT::verify($token);

        if (!$decoded) {
            Response::unauthorized('Token si sahihi au imeisha. Tafadhali login tena.');
        }

        // Rudisha user data
        return $decoded;
    }

    // Supervisor tu
    public static function requireSupervisor() {
        $user = self::authenticate();
        if ($user['role'] !== 'supervisor') {
            Response::error('Ruhusa hii ni kwa supervisors tu.', 403);
        }
        return $user;
    }

    // Student tu
    public static function requireStudent() {
        $user = self::authenticate();
        if ($user['role'] !== 'student') {
            Response::error('Ruhusa hii ni kwa students tu.', 403);
        }
        return $user;
    }
}