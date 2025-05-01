<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Get user comments count endpoint accessed");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    debug_log("OPTIONS request received");
    http_response_code(200);
    exit;
}

// Include database connection
include_once '../database/db_connect.php';

// Get user ID from request
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if (!$user_id) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "User ID is required"
    ]);
    exit;
}

try {
    // Query to count user's comments
    $query = "SELECT COUNT(*) as comment_count FROM comments WHERE user_id = :user_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $comment_count = $result['comment_count'] ?? 0;
    
    debug_log("User $user_id has $comment_count comments");
    
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "count" => $comment_count
    ]);
} catch (Exception $e) {
    debug_log("Error fetching comment count: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to get comment count",
        "debug" => $e->getMessage()
    ]);
}
?> 