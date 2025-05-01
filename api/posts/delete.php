<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Delete post endpoint accessed");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    debug_log("OPTIONS request received");
    http_response_code(200);
    exit;
}

// Include database connection
include_once '../database/db_connect.php';

// Get posted data
$input = file_get_contents("php://input");
debug_log("Raw input received: " . $input);
$data = json_decode($input);

// Check if data is valid
if (!isset($data->post_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Post ID and user ID are required"]);
    exit;
}

try {
    // First verify the user owns this post
    $verify_query = "SELECT id FROM posts WHERE id = :post_id AND user_id = :user_id";
    $verify_stmt = $conn->prepare($verify_query);
    $verify_stmt->bindParam(":post_id", $data->post_id);
    $verify_stmt->bindParam(":user_id", $data->user_id);
    $verify_stmt->execute();
    
    if ($verify_stmt->rowCount() === 0) {
        // User doesn't own this post or post doesn't exist
        http_response_code(403);
        debug_log("Delete attempt failed: User {$data->user_id} doesn't own post {$data->post_id} or post doesn't exist");
        echo json_encode([
            "status" => "error", 
            "message" => "You don't have permission to delete this post or the post doesn't exist"
        ]);
        exit;
    }
    
    // Delete associated likes first (foreign key constraint)
    $delete_likes_query = "DELETE FROM likes WHERE post_id = :post_id";
    $delete_likes_stmt = $conn->prepare($delete_likes_query);
    $delete_likes_stmt->bindParam(":post_id", $data->post_id);
    $delete_likes_stmt->execute();
    
    // Delete associated comments (foreign key constraint)
    $delete_comments_query = "DELETE FROM comments WHERE post_id = :post_id";
    $delete_comments_stmt = $conn->prepare($delete_comments_query);
    $delete_comments_stmt->bindParam(":post_id", $data->post_id);
    $delete_comments_stmt->execute();
    
    // Now delete the post
    $delete_post_query = "DELETE FROM posts WHERE id = :post_id";
    $delete_post_stmt = $conn->prepare($delete_post_query);
    $delete_post_stmt->bindParam(":post_id", $data->post_id);
    
    if ($delete_post_stmt->execute()) {
        debug_log("Post {$data->post_id} deleted successfully by user {$data->user_id}");
        http_response_code(200);
        echo json_encode([
            "status" => "success", 
            "message" => "Post deleted successfully"
        ]);
    } else {
        debug_log("Failed to delete post: " . print_r($delete_post_stmt->errorInfo(), true));
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Failed to delete post"
        ]);
    }
} catch (Exception $e) {
    debug_log("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "A server error occurred. Please try again later.",
        "debug" => $e->getMessage()
    ]);
}
?> 