<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Create post endpoint accessed");

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
    !empty($data->user_id) &&
    !empty($data->title) &&
    !empty($data->content) &&
    !empty($data->category) &&
    !empty($data->institution)
) {
    try {
        debug_log("Processing post creation request");
        
        // Process images
        $images_json = null;
        if (!empty($data->images) && is_array($data->images)) {
            $images_json = json_encode($data->images, JSON_UNESCAPED_SLASHES);
            debug_log("Processed images: " . $images_json);
        }
        
        // Prepare insert query
        $query = "INSERT INTO posts (user_id, title, content, category, institution, images) 
                  VALUES (:user_id, :title, :content, :category, :institution, :images)";
        debug_log("Prepared query: " . $query);
        $stmt = $conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":user_id", $data->user_id);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":content", $data->content);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":institution", $data->institution);
        $stmt->bindParam(":images", $images_json);
        debug_log("Parameters bound");
        
        // Execute query
        if ($stmt->execute()) {
            // Get last inserted ID
            $last_id = $conn->lastInsertId();
            debug_log("Post created successfully with ID: " . $last_id);
            
            // Set response code - 201 created
            http_response_code(201);
            
            // Return success response
            echo json_encode([
                "status" => "success", 
                "message" => "Post created successfully",
                "post_id" => $last_id
            ], JSON_UNESCAPED_SLASHES);
        } else {
            // Set response code - 503 service unavailable
            debug_log("Failed to execute query: " . print_r($stmt->errorInfo(), true));
            http_response_code(503);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "Unable to create post"], JSON_UNESCAPED_SLASHES);
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
        ], JSON_UNESCAPED_SLASHES);
    }
} else {
    // Set response code - 400 bad request
    debug_log("Required fields missing");
    debug_log("User ID: " . (isset($data->user_id) ? $data->user_id : 'missing'));
    debug_log("Title: " . (isset($data->title) ? $data->title : 'missing'));
    debug_log("Content: " . (isset($data->content) ? 'provided' : 'missing'));
    debug_log("Category: " . (isset($data->category) ? $data->category : 'missing'));
    debug_log("Institution: " . (isset($data->institution) ? $data->institution : 'missing'));
    http_response_code(400);
    
    // Return more descriptive error response
    echo json_encode([
        "status" => "error", 
        "message" => "User ID, title, content, category, and institution are required to create a post."
    ], JSON_UNESCAPED_SLASHES);
}
?> 