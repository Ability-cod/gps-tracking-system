<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/LocationController.php';
require_once __DIR__ . '/../controllers/LocationHistoryController.php';
require_once __DIR__ . '/../controllers/AssessmentController.php';
require_once __DIR__ . '/../controllers/VisitLogController.php';
require_once __DIR__ . '/../controllers/ProfileController.php';
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method   = $_SERVER['REQUEST_METHOD'];
$fullPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/Mzumbe-GPS-PHP/backend';
$path     = str_replace($basePath, '', $fullPath);
if (empty($path)) $path = '/';

// AUTH
if ($method === 'POST' && $path === '/auth/login') { (new AuthController())->login(); exit; }
if ($method === 'GET'  && $path === '/auth/profile') { $u = AuthMiddleware::authenticate(); (new AuthController())->profile($u); exit; }

// PROFILE
if ($method === 'GET' && $path === '/profile') { $u = AuthMiddleware::authenticate(); (new ProfileController())->getProfile($u); exit; }
if ($method === 'PUT' && $path === '/profile') { $u = AuthMiddleware::authenticate(); (new ProfileController())->updateProfile($u); exit; }
if ($method === 'PUT' && $path === '/profile/password') { $u = AuthMiddleware::authenticate(); (new ProfileController())->changePassword($u); exit; }

// ADMIN
if ($method === 'GET'    && $path === '/admin/stats')       { $u = AuthMiddleware::authenticate(); (new AdminController())->getStats($u); exit; }
if ($method === 'GET'    && $path === '/admin/users')        { $u = AuthMiddleware::authenticate(); (new AdminController())->getAllUsers($u); exit; }
if ($method === 'GET'    && $path === '/admin/supervisors')  { $u = AuthMiddleware::authenticate(); (new AdminController())->getSupervisors($u); exit; }
if ($method === 'POST'   && $path === '/admin/users')        { $u = AuthMiddleware::authenticate(); (new AdminController())->addUser($u); exit; }
if ($method === 'DELETE' && preg_match('/^\/admin\/users\/(\d+)$/', $path, $m))          { $u = AuthMiddleware::authenticate(); (new AdminController())->deleteUser($u, $m[1]); exit; }
if ($method === 'PUT'    && preg_match('/^\/admin\/users\/(\d+)\/password$/', $path, $m)) { $u = AuthMiddleware::authenticate(); (new AdminController())->resetPassword($u, $m[1]); exit; }
if ($method === 'PUT'    && preg_match('/^\/admin\/users\/(\d+)$/', $path, $m))           { $u = AuthMiddleware::authenticate(); (new AdminController())->updateUser($u, $m[1]); exit; }

// REPORTS
if ($method === 'GET' && $path === '/reports/students') { $u = AuthMiddleware::authenticate(); (new ReportController())->getStudentsReport($u); exit; }

// LOCATIONS
if ($method === 'POST'   && $path === '/locations/update')   { $u = AuthMiddleware::authenticate(); (new LocationController())->update($u); exit; }
if ($method === 'DELETE' && $path === '/locations/stop')     { $u = AuthMiddleware::authenticate(); (new LocationController())->stop($u); exit; }
if ($method === 'GET'    && $path === '/locations/students') { $u = AuthMiddleware::authenticate(); (new LocationController())->getMyStudents($u); exit; }

// LOCATION HISTORY
if ($method === 'GET' && $path === '/location-history') { $u = AuthMiddleware::authenticate(); (new LocationHistoryController())->getAll($u); exit; }
if ($method === 'GET' && preg_match('/^\/location-history\/(\d+)$/', $path, $m)) { $u = AuthMiddleware::authenticate(); (new LocationHistoryController())->getByStudent($u, $m[1]); exit; }

// ASSESSMENTS
if ($method === 'POST' && $path === '/assessments')     { $u = AuthMiddleware::authenticate(); (new AssessmentController())->upsert($u); exit; }
if ($method === 'GET'  && $path === '/assessments/my')  { $u = AuthMiddleware::authenticate(); (new AssessmentController())->getMySupervisorAssessments($u); exit; }
if ($method === 'GET'  && preg_match('/^\/assessments\/(\d+)$/', $path, $m)) { $u = AuthMiddleware::authenticate(); (new AssessmentController())->getByStudent($u, $m[1]); exit; }

// VISITS
if ($method === 'POST' && $path === '/visits')            { $u = AuthMiddleware::authenticate(); (new VisitLogController())->create($u); exit; }
if ($method === 'GET'  && $path === '/visits/my-visits')  { $u = AuthMiddleware::authenticate(); (new VisitLogController())->getMyVisits($u); exit; }
if ($method === 'GET'  && $path === '/visits/supervisor') { $u = AuthMiddleware::authenticate(); (new VisitLogController())->getMySupervisorVisits($u); exit; }