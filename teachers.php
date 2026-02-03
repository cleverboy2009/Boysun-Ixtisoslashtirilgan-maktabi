<?php
session_start();
header('Content-Type: application/json');

$db_file = 'teachers.json';

function get_teachers() {
    global $db_file;
    if (!file_exists($db_file)) return [];
    return json_decode(file_get_contents($db_file), true);
}

function save_teachers($data) {
    global $db_file;
    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode(get_teachers());
    exit;
}

if (!isset($_SESSION['logged_in'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $teachers = get_teachers();
    $new_id = 1;
    foreach ($teachers as $t) {
        if (isset($t['id']) && $t['id'] >= $new_id) $new_id = $t['id'] + 1;
    }
    
    $new_teacher = [
        'id' => $new_id,
        'name' => strip_tags($input['name']),
        'subject' => strip_tags($input['subject']),
        'image' => $input['image'] ?? null
    ];
    
    $teachers[] = $new_teacher;
    save_teachers($teachers);
    echo json_encode(['success' => true]);
} 

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    
    $teachers = get_teachers();
    $teachers = array_filter($teachers, function($t) use ($id) { return $t['id'] != $id; });
    save_teachers(array_values($teachers));
    echo json_encode(['success' => true]);
}
?>
