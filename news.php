<?php
session_start();
header('Content-Type: application/json');

$db_file = 'news.json';

function get_news() {
    global $db_file;
    if (!file_exists($db_file)) return [];
    return json_decode(file_get_contents($db_file), true);
}

function save_news($data) {
    global $db_file;
    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode(get_news());
    exit;
}

// Admin only for other methods
if (!isset($_SESSION['logged_in'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $news = get_news();
    $new_id = 1;
    foreach ($news as $n) {
        if (isset($n['id']) && $n['id'] >= $new_id) $new_id = $n['id'] + 1;
    }
    
    $new_entry = [
        'id' => $new_id,
        'title' => strip_tags($input['title']),
        'date' => strip_tags($input['date']),
        'content' => strip_tags($input['content']),
        'image' => $input['image'] ?? null
    ];
    
    array_unshift($news, $new_entry);
    save_news($news);
    echo json_encode(['success' => true, 'news' => $new_entry]);
} 

elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    
    $news = get_news();
    foreach ($news as &$item) {
        if ($item['id'] == $id) {
            $item['title'] = strip_tags($input['title']);
            $item['date'] = strip_tags($input['date']);
            $item['content'] = strip_tags($input['content']);
            if (isset($input['image'])) $item['image'] = $input['image'];
            save_news($news);
            echo json_encode(['success' => true]);
            exit;
        }
    }
} 

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    
    $news = get_news();
    $news = array_filter($news, function($n) use ($id) { return $n['id'] != $id; });
    save_news(array_values($news));
    echo json_encode(['success' => true]);
}
?>
