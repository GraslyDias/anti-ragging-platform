<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Create comment endpoint accessed");

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
    !empty($data->user_id) &&
    !empty($data->content)
) {
    try {
        debug_log("Processing comment creation for post: " . $data->post_id . " by user: " . $data->user_id);
        
        // Prepare insert query
        $query = "INSERT INTO comments (post_id, user_id, content) VALUES (:post_id, :user_id, :content)";
        debug_log("Prepared query: " . $query);
        $stmt = $conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":post_id", $data->post_id);
        $stmt->bindParam(":user_id", $data->user_id);
        $stmt->bindParam(":content", $data->content);
        debug_log("Parameters bound");
        
        // Execute query
        if ($stmt->execute()) {
            // Get last inserted ID
            $last_id = $conn->lastInsertId();
            debug_log("Comment created successfully with ID: " . $last_id);
            
            // Get user name
            $user_query = "SELECT name FROM users WHERE id = :user_id";
            $user_stmt = $conn->prepare($user_query);
            $user_stmt->bindParam(":user_id", $data->user_id);
            $user_stmt->execute();
            $user = $user_stmt->fetch();
            debug_log("Retrieved user info: " . print_r($user, true));
            
            // Set response code - 201 created
            http_response_code(201);
            
            // Return success response
            echo json_encode([
                "status" => "success", 
                "message" => "Comment added successfully",
                "comment" => [
                    "id" => $last_id,
                    "content" => $data->content,
                    "created_at" => date("Y-m-d H:i:s"),
                    "user" => [
                        "id" => $data->user_id,
                        "name" => $user['name']
                    ]
                ]
            ]);
        } else {
            // Set response code - 503 service unavailable
            debug_log("Failed to execute query: " . print_r($stmt->errorInfo(), true));
            http_response_code(503);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "Unable to add comment"]);
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
    debug_log("Content: " . (isset($data->content) ? 'provided' : 'missing'));
    http_response_code(400);
    
    // Return more descriptive error response
    echo json_encode([
        "status" => "error", 
        "message" => "Post ID, user ID, and content are required to create a comment."
    ]);
}
?> 