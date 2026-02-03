<?php
session_start();
header('Content-Type: application/json');

$admin_login = "boysun";
$admin_pass = "boysun2026.09";

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($input['login']) && isset($input['password'])) {
        if ($input['login'] === $admin_login && $input['password'] === $admin_pass) {
            $_SESSION['logged_in'] = true;
            echo json_encode(['success' => true]);
            exit;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['status'])) {
    echo json_encode(['logged_in' => isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['logout'])) {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(401);
echo json_encode(['error' => 'Xato login yoki parol']);
?>
