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

debug_log("Delete comment endpoint accessed");

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
if (!isset($data->comment_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Comment ID and user ID are required"]);
    exit;
}

try {
    // First verify the user owns this comment
    $verify_query = "SELECT id FROM comments WHERE id = :comment_id AND user_id = :user_id";
    $verify_stmt = $conn->prepare($verify_query);
    $verify_stmt->bindParam(":comment_id", $data->comment_id);
    $verify_stmt->bindParam(":user_id", $data->user_id);
    $verify_stmt->execute();
    
    if ($verify_stmt->rowCount() === 0) {
        // User doesn't own this comment or comment doesn't exist
        http_response_code(403);
        debug_log("Delete attempt failed: User {$data->user_id} doesn't own comment {$data->comment_id} or comment doesn't exist");
        echo json_encode([
            "status" => "error", 
            "message" => "You don't have permission to delete this comment or the comment doesn't exist"
        ]);
        exit;
    }
    
    // Get the post_id before deleting the comment (for return value)
    $get_post_query = "SELECT post_id FROM comments WHERE id = :comment_id";
    $get_post_stmt = $conn->prepare($get_post_query);
    $get_post_stmt->bindParam(":comment_id", $data->comment_id);
    $get_post_stmt->execute();
    $post_id = $get_post_stmt->fetch(PDO::FETCH_ASSOC)['post_id'];
    
    // Delete the comment
    $delete_query = "DELETE FROM comments WHERE id = :comment_id";
    $delete_stmt = $conn->prepare($delete_query);
    $delete_stmt->bindParam(":comment_id", $data->comment_id);
    
    if ($delete_stmt->execute()) {
        debug_log("Comment {$data->comment_id} deleted successfully by user {$data->user_id}");
        http_response_code(200);
        echo json_encode([
            "status" => "success", 
            "message" => "Comment deleted successfully",
            "post_id" => $post_id
        ]);
    } else {
        debug_log("Failed to delete comment: " . print_r($delete_stmt->errorInfo(), true));
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Failed to delete comment"
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