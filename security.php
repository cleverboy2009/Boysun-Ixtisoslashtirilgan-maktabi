<?php
// security.php - Central Security Module
// Provides headers, input cleaning, and protection mechanisms.

// 1. HTTP Security Headers
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: camera=(), microphone=(), geolocation=()");

// 2. Session Security
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Strict');
    session_start();
}

// Regenerate session ID periodically
if (!isset($_SESSION['last_regen'])) {
    $_SESSION['last_regen'] = time();
} elseif (time() - $_SESSION['last_regen'] > 300) {
    session_regenerate_id(true);
    $_SESSION['last_regen'] = time();
}

// 3. CSRF Protection
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// 4. Input Sanitization
function clean_input($data) {
    if (is_array($data)) {
        return array_map('clean_input', $data);
    }
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// 5. JSON Response Helper
function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function json_error($message, $status = 400) {
    json_response(['error' => $message], $status);
}

// 6. Rate Limiting (Simple File-based)
function check_rate_limit($action, $limit = 5, $period = 60) {
    // Requires a writable /tmp or similar, skipping for simple setups to avoid file permission issues on shared hosting
    // unless specifically requested. We'll assume session-based limiting for now.
    $key = 'rate_limit_' . $action;
    $current_time = time();
    
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 1, 'start_time' => $current_time];
    } else {
        if ($current_time - $_SESSION[$key]['start_time'] < $period) {
            if($_SESSION[$key]['count'] >= $limit) {
                return false;
            }
            $_SESSION[$key]['count']++;
        } else {
            $_SESSION[$key] = ['count' => 1, 'start_time' => $current_time];
        }
    }
    return true;
}
?>
