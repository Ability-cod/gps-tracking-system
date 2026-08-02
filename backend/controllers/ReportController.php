<?php
// backend/controllers/ReportController.php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Assessment.php';
require_once __DIR__ . '/../models/VisitLog.php';
require_once __DIR__ . '/../utils/Response.php';

class ReportController {

    // GET /reports/students — returns report data as JSON
    // Frontend will use this data to generate PDF using jsPDF
    public function getStudentsReport($authUser) {
        if ($authUser['role'] !== 'supervisor') {
            Response::error('Only supervisors can generate reports.', 403);
        }

        $userModel       = new User();
        $assessmentModel = new Assessment();
        $visitLogModel   = new VisitLog();

        // Get all students
        $students = $userModel->getStudentsBySupervisor($authUser['id']);

        // Get all assessments for supervisor
        $assessmentsList = $assessmentModel->getBySupervisorId($authUser['id']);
        $assessmentsMap  = [];
        foreach ($assessmentsList as $a) {
            $assessmentsMap[$a['student_id']] = $a;
        }

        // Get all visit logs for supervisor
        $visitLogs    = $visitLogModel->getBySupervisorId($authUser['id']);
        $visitLogsMap = [];
        foreach ($visitLogs as $log) {
            if (!isset($visitLogsMap[$log['student_id']])) {
                $visitLogsMap[$log['student_id']] = [];
            }
            $visitLogsMap[$log['student_id']][] = $log;
        }

        // Build report data
        $reportData = [];
        foreach ($students as $student) {
            $assessment  = $assessmentsMap[$student['id']] ?? null;
            $studentLogs = $visitLogsMap[$student['id']] ?? [];

            $reportData[] = [
                'id'             => $student['id'],
                'name'           => $student['name'],
                'email'          => $student['email'],
                'registered_at'  => $student['created_at'],
                'assessment'     => [
                    'status'      => $assessment['status']      ?? 'not_assessed',
                    'note'        => $assessment['note']         ?? '',
                    'assessed_at' => $assessment['assessed_at']  ?? null,
                ],
                'visits'         => $studentLogs,
                'total_visits'   => count($studentLogs),
            ];
        }

        Response::success([
            'supervisor' => [
                'name'  => $authUser['name'],
                'email' => $authUser['email'],
            ],
            'generated_at' => date('Y-m-d H:i:s'),
            'total_students' => count($students),
            'total_assessed' => count(array_filter($reportData, fn($s) => $s['assessment']['status'] === 'assessed')),
            'students'       => $reportData,
        ], 'Report data retrieved successfully.');
    }
}