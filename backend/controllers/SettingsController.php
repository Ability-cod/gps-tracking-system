<?php
// backend/controllers/SettingsController.php
require_once __DIR__ . '/../models/InstitutionSettings.php';
require_once __DIR__ . '/../utils/Response.php';

class SettingsController {

    // GET /settings — public (anyone can read institution info)
    public function get() {
        $model    = new InstitutionSettings();
        $settings = $model->get();
        if (!$settings) {
            Response::error('Settings not found.', 404);
        }
        Response::success($settings, 'Settings retrieved successfully.');
    }

    // PUT /settings — admin only
    public function update($authUser) {
        if ($authUser['role'] !== 'admin') {
            Response::error('Access denied. Admin only.', 403);
        }
        $body  = json_decode(file_get_contents('php://input'), true);
        $model = new InstitutionSettings();

        if (empty($body['name'])) {
            Response::error('Institution name is required.');
        }
        if (empty($body['program_label'])) {
            Response::error('Program label is required.');
        }

        $updated = $model->update($body);
        if (!$updated) {
            Response::serverError('Failed to update settings.');
        }
        Response::success($updated, 'Settings updated successfully.');
    }
}