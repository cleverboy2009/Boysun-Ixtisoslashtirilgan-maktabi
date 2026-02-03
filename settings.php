<?php
session_start();
header('Content-Type: application/json');

$db_file = 'settings.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($db_file)) {
        echo json_encode(["site_name" => "Boysun IM", "phone" => "+998 91 969 23 63"]);
    } else {
        echo file_get_contents($db_file);
    }
    exit;
}

if (!isset($_SESSION['logged_in'])) {
    http_response_code(401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    file_put_contents($db_file, json_encode($input, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
}
?>
