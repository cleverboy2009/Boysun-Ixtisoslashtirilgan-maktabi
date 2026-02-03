<?php
// contact.php - Secure Contact Form Handler
require_once 'security.php';

// Check rate limit
if (!check_rate_limit('contact_submit', 3, 60)) { // 3 requests per minute
    json_error('Juda ko\'p urinish. Iltimos, bir daqiqadan so\'ng qayta urinib ko\'ring.', 429);
}

// Handle Token Request (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'token') {
    json_response(['csrf_token' => $_SESSION['csrf_token']]);
}

// Handle Form Submission (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF
    $headers = apache_request_headers();
    $token = isset($headers['X-CSRFToken']) ? $headers['X-CSRFToken'] : (isset($input['csrf_token']) ? $input['csrf_token'] : '');
    
    if (!verify_csrf_token($token)) {
        // Log potential attack
        error_log("CSRF Mismatch: IP " . $_SERVER['REMOTE_ADDR']);
        json_error('Xavfsizlik xatoligi: CSRF token noto\'g\'ri.', 403);
    }
    
    // Sanitize Input using security.php helper
    $clean_data = clean_input($input);
    
    $name = $clean_data['name'] ?? '';
    $email = $clean_data['email'] ?? '';
    $phone = $clean_data['phone'] ?? '';
    $message = $clean_data['message'] ?? '';
    
    // Validate
    if (empty($name) || strlen($name) < 2) json_error('Ismingizni to\'g\'ri kiriting.');
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Email noto\'g\'ri.');
    if (empty($message) || strlen($message) < 10) json_error('Xabar matni juda qisqa.');
    
    // Prepare data for storage (JSON file for simplicity as per project structure)
    $contact_entry = [
        'id' => uniqid(),
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'], // Simple logging
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message
    ];
    
    // Save to messages.json
    $file = 'messages.json';
    $current_data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    if (!is_array($current_data)) $current_data = [];
    
    array_unshift($current_data, $contact_entry); // Add to beginning
    
    if (file_put_contents($file, json_encode($current_data, JSON_PRETTY_PRINT))) {
        json_response(['success' => true, 'message' => 'Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog\'lanamiz.']);
    } else {
        json_error('Tizim xatoligi: Xabarni saqlashda muammo bo\'ldi.', 500);
    }
}
?>
