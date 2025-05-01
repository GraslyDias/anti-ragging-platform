<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Change password endpoint accessed");

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

// Check if data is not empty
if (
    !empty($data->id) &&
    !empty($data->currentPassword) &&
    !empty($data->newPassword)
) {
    try {
        debug_log("Retrieving user password for ID: " . $data->id);
        // Get current password from database
        $query = "SELECT password FROM users WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->id);
        $stmt->execute();
        
        // Check if user exists
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch();
            debug_log("User found, verifying current password");
            
            // Verify current password
            if (password_verify($data->currentPassword, $user['password'])) {
                debug_log("Current password verified, updating to new password");
                
                // Hash the new password
                $hashed_password = password_hash($data->newPassword, PASSWORD_DEFAULT);
                
                // Prepare update query
                $update_query = "UPDATE users SET password = :password WHERE id = :id";
                $update_stmt = $conn->prepare($update_query);
                
                // Bind values
                $update_stmt->bindParam(":password", $hashed_password);
                $update_stmt->bindParam(":id", $data->id);
                
                // Execute query
                if ($update_stmt->execute()) {
                    // Set response code - 200 OK
                    debug_log("Password updated successfully for user ID: " . $data->id);
                    http_response_code(200);
                    
                    // Return success response
                    echo json_encode(["status" => "success", "message" => "Password changed successfully"]);
                } else {
                    // Set response code - 503 service unavailable
                    debug_log("Failed to execute update query: " . print_r($update_stmt->errorInfo(), true));
                    http_response_code(503);
                    
                    // Return error response
                    echo json_encode(["status" => "error", "message" => "Unable to update password"]);
                }
            } else {
                debug_log("Current password verification failed");
                // Set response code - 401 unauthorized
                http_response_code(401);
                
                // Return error response
                echo json_encode(["status" => "error", "message" => "Current password is incorrect"]);
            }
        } else {
            debug_log("User not found with ID: " . $data->id);
            // Set response code - 404 not found
            http_response_code(404);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "User not found"]);
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
    debug_log("Current Password: " . (isset($data->currentPassword) ? 'provided' : 'missing'));
    debug_log("New Password: " . (isset($data->newPassword) ? 'provided' : 'missing'));
    http_response_code(400);
    
    // Return more descriptive error response
    echo json_encode([
        "status" => "error", 
        "message" => "User ID, current password, and new password are required to change password."
    ]);
}
?> 