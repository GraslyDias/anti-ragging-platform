<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Toggle support endpoint accessed");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    debug_log("OPTIONS request received");
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
include_once '../database/db_connect.php';

// Get posted data
$input = file_get_contents("php://input");
debug_log("Raw input received: " . $input);
$data = json_decode($input);

// For debugging
debug_log("Decoded data: " . print_r($data, true));

// Check if data is not empty
if (
    !empty($data->post_id) &&
    !empty($data->user_id)
) {
    try {
        debug_log("Processing toggle support for post: " . $data->post_id . " by user: " . $data->user_id);
        
        // Check if the user has already supported the post
        $check_query = "SELECT id FROM likes WHERE post_id = :post_id AND user_id = :user_id";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bindParam(":post_id", $data->post_id);
        $check_stmt->bindParam(":user_id", $data->user_id);
        $check_stmt->execute();
        
        // If support exists, remove it
        if ($check_stmt->rowCount() > 0) {
            $like_id = $check_stmt->fetch()['id'];
            debug_log("Support exists (ID: $like_id) - removing it");
            
            $delete_query = "DELETE FROM likes WHERE id = :like_id";
            $delete_stmt = $conn->prepare($delete_query);
            $delete_stmt->bindParam(":like_id", $like_id);
            
            if ($delete_stmt->execute()) {
                debug_log("Support removed successfully");
                
                // Get total support count for this post
                $count_query = "SELECT COUNT(*) as count FROM likes WHERE post_id = :post_id";
                $count_stmt = $conn->prepare($count_query);
                $count_stmt->bindParam(":post_id", $data->post_id);
                $count_stmt->execute();
                $likes_count = $count_stmt->fetch()['count'];
                
                // Set response code - 200 success
                http_response_code(200);
                
                // Return success response
                echo json_encode([
                    "status" => "success", 
                    "message" => "Support removed successfully",
                    "liked" => false,
                    "likes_count" => $likes_count
                ]);
            } else {
                debug_log("Failed to remove support: " . print_r($delete_stmt->errorInfo(), true));
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to remove support"]);
            }
        } 
        // Otherwise, add a new support
        else {
            debug_log("Support doesn't exist - adding it");
            
            $insert_query = "INSERT INTO likes (post_id, user_id) VALUES (:post_id, :user_id)";
            $insert_stmt = $conn->prepare($insert_query);
            $insert_stmt->bindParam(":post_id", $data->post_id);
            $insert_stmt->bindParam(":user_id", $data->user_id);
            
            if ($insert_stmt->execute()) {
                debug_log("Support added successfully");
                
                // Get total support count for this post
                $count_query = "SELECT COUNT(*) as count FROM likes WHERE post_id = :post_id";
                $count_stmt = $conn->prepare($count_query);
                $count_stmt->bindParam(":post_id", $data->post_id);
                $count_stmt->execute();
                $likes_count = $count_stmt->fetch()['count'];
                
                // Set response code - 201 created
                http_response_code(201);
                
                // Return success response
                echo json_encode([
                    "status" => "success", 
                    "message" => "Post supported successfully",
                    "liked" => true,
                    "likes_count" => $likes_count
                ]);
            } else {
                debug_log("Failed to add support: " . print_r($insert_stmt->errorInfo(), true));
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to support post"]);
            }
        }
    } catch (Exception $e) {
        // Set response code - 500 internal server error
        debug_log("Exception: " . $e->getMessage());
        http_response_code(500);
        
        // Return more user-friendly error response
        echo json_encode([
            "status" => "error", 
            "message" => "A server error occurred. Please try again later.",
            "debug" => $e->getMessage() // Include for debugging but would remove in production
        ]);
    }
} else {
    // Set response code - 400 bad request
    debug_log("Required fields missing");
    debug_log("Post ID: " . (isset($data->post_id) ? $data->post_id : 'missing'));
    debug_log("User ID: " . (isset($data->user_id) ? $data->user_id : 'missing'));
    http_response_code(400);
    
    // Return more descriptive error response
    echo json_encode([
        "status" => "error", 
        "message" => "Post ID and user ID are required to toggle support."
    ]);
}
?> 