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

debug_log("Get user info endpoint accessed");

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
    // Query to fetch user information
    $query = "SELECT id, name, email, created_at, updated_at FROM users WHERE id = :user_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        debug_log("User information retrieved for user ID: $user_id");
        
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "user" => $user
        ]);
    } else {
        debug_log("User not found with ID: $user_id");
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "User not found"
        ]);
    }
} catch (Exception $e) {
    debug_log("Error fetching user info: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to get user information",
        "debug" => $e->getMessage()
    ]);
}
?> 