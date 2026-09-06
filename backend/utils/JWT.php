<?php
// backend/utils/JWT.php
// Reads JWT_SECRET directly from environment — no config.php needed

class JWT {

    private static function getSecret() {
        return $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: 'mzumbe_secret_2026';
    }

    private static function getExpiry() {
        return (int)($_ENV['JWT_EXPIRY'] ?? getenv('JWT_EXPIRY') ?: 604800);
    }

    public static function generate($payload) {
        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256',
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::getExpiry();
        $payload        = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", self::getSecret(), true)
        );

        return "$header.$payload.$signature";
    }

    public static function verify($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;

        $validSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", self::getSecret(), true)
        );

        if ($signature !== $validSignature) return null;

        $data = json_decode(self::base64UrlDecode($payload), true);

        if (isset($data['exp']) && $data['exp'] < time()) return null;

        return $data;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(
            strtr($data, '-_', '+/') .
            str_repeat('=', 3 - (3 + strlen($data)) % 4)
        );
    }
}