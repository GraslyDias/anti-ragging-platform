<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Update profile endpoint accessed");

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
    !empty($data->id) &&
    !empty($data->name) &&
    !empty($data->email)
) {
    try {
        debug_log("Checking if email already exists for another user");
        // Check if email already exists for another user
        $check_query = "SELECT COUNT(*) as count FROM users WHERE email = :email AND id != :id";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->bindParam(":id", $data->id);
        $check_stmt->execute();
        $row = $check_stmt->fetch();
        
        if ($row['count'] > 0) {
            // Return error response
            debug_log("Email already exists for another user: " . $data->email);
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email is already in use by another account"]);
            exit;
        }
        
        // Prepare update query
        $query = "UPDATE users SET name = :name, email = :email WHERE id = :id";
        debug_log("Prepared query: " . $query);
        $stmt = $conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":id", $data->id);
        debug_log("Parameters bound");
        
        // Execute query
        if ($stmt->execute()) {
            // Get updated user data
            $get_user_query = "SELECT id, name, email FROM users WHERE id = :id";
            $get_user_stmt = $conn->prepare($get_user_query);
            $get_user_stmt->bindParam(":id", $data->id);
            $get_user_stmt->execute();
            $updated_user = $get_user_stmt->fetch();
            
            // Set response code - 200 OK
            debug_log("Profile updated successfully for user ID: " . $data->id);
            http_response_code(200);
            
            // Return success response
            echo json_encode([
                "status" => "success", 
                "message" => "Profile updated successfully",
                "user" => $updated_user
            ]);
        } else {
            // Set response code - 503 service unavailable
            debug_log("Failed to execute query: " . print_r($stmt->errorInfo(), true));
            http_response_code(503);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "Unable to update profile"]);
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
    debug_log("ID: " . (isset($data->id) ? $data->id : 'missing'));
    debug_log("Name: " . (isset($data->name) ? $data->name : 'missing'));
    debug_log("Email: " . (isset($data->email) ? $data->email : 'missing'));
    http_response_code(400);
    
    // Return more descriptive error response
    echo json_encode([
        "status" => "error", 
        "message" => "User ID, name, and email are required to update profile."
    ]);
}
?> 