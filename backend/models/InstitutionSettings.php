<?php
// backend/models/InstitutionSettings.php
require_once __DIR__ . '/../config/database.php';

class InstitutionSettings {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Get settings (always one row)
    public function get() {
        $sql  = "SELECT * FROM institution_settings LIMIT 1";
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }

    // Update settings — admin only
    public function update($data) {
        $sql = "UPDATE institution_settings SET
                    name            = :name,
                    short_name      = :short_name,
                    logo_url        = :logo_url,
                    primary_color   = :primary_color,
                    secondary_color = :secondary_color,
                    program_label   = :program_label,
                    address         = :address,
                    website         = :website,
                    email           = :email,
                    phone           = :phone,
                    updated_at      = NOW()
                WHERE id = 1
                RETURNING *";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name'            => trim($data['name']            ?? 'My University'),
            ':short_name'      => trim($data['short_name']      ?? 'MU'),
            ':logo_url'        => trim($data['logo_url']        ?? '') ?: null,
            ':primary_color'   => trim($data['primary_color']   ?? '#1a5276'),
            ':secondary_color' => trim($data['secondary_color'] ?? '#27ae60'),
            ':program_label'   => trim($data['program_label']   ?? 'Field Attachment'),
            ':address'         => trim($data['address']         ?? '') ?: null,
            ':website'         => trim($data['website']         ?? '') ?: null,
            ':email'           => trim($data['email']           ?? '') ?: null,
            ':phone'           => trim($data['phone']           ?? '') ?: null,
        ]);
        return $stmt->fetch();
    }
}