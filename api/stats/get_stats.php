<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Get statistics endpoint accessed");

// Include database connection
include_once '../database/db_connect.php';

try {
    // Get total posts count
    $posts_query = "SELECT COUNT(*) as total_posts FROM posts";
    $posts_stmt = $conn->prepare($posts_query);
    $posts_stmt->execute();
    $total_posts = $posts_stmt->fetch(PDO::FETCH_ASSOC)['total_posts'];
    
    // Get unique institutions count
    $institutions_query = "SELECT COUNT(DISTINCT institution) as total_institutions FROM posts WHERE institution IS NOT NULL AND institution != ''";
    $institutions_stmt = $conn->prepare($institutions_query);
    $institutions_stmt->execute();
    $total_institutions = $institutions_stmt->fetch(PDO::FETCH_ASSOC)['total_institutions'];
    
    // Get active users count (users who have either posted or commented)
    $users_query = "SELECT COUNT(DISTINCT id) as total_users FROM users";
    $users_stmt = $conn->prepare($users_query);
    $users_stmt->execute();
    $total_users = $users_stmt->fetch(PDO::FETCH_ASSOC)['total_users'];
    
    // Return the statistics
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "stats" => [
            "total_posts" => (int)$total_posts,
            "total_institutions" => (int)$total_institutions,
            "total_users" => (int)$total_users
        ]
    ]);
    
} catch (Exception $e) {
    // Set response code - 500 internal server error
    http_response_code(500);
    debug_log("Error in get_stats.php: " . $e->getMessage());
    // Return error response
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?> 