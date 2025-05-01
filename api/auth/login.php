<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Login endpoint accessed");

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
    !empty($data->email) &&
    !empty($data->password)
) {
    try {
        debug_log("Checking credentials for email: " . $data->email);
        // Prepare query to get user details
        $query = "SELECT id, name, email, password FROM users WHERE email = :email";
        $stmt = $conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":email", $data->email);
        
        // Execute query
        $stmt->execute();
        debug_log("Query executed, checking user");
        
        // Check if user exists
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch();
            debug_log("User found, verifying password");
            
            // Verify password
            if (password_verify($data->password, $user['password'])) {
                debug_log("Password verified, login successful");
                // Remove password from response
                unset($user['password']);
                
                // Set response code - 200 success
                http_response_code(200);
                
                // Return success response with user details
                echo json_encode([
                    "status" => "success",
                    "message" => "Login successful",
                    "user" => $user
                ]);
            } else {
                debug_log("Password verification failed");
                // Set response code - 401 unauthorized
                http_response_code(401);
                
                // Return error response with user-friendly message
                echo json_encode([
                    "status" => "error", 
                    "message" => "Incorrect email or password. Please try again."
                ]);
            }
        } else {
            debug_log("User not found: " . $data->email);
            // Set response code - 401 unauthorized
            http_response_code(401);
            
            // Return error response with user-friendly message
            // Note: For security, don't specify whether email or password is wrong
            echo json_encode([
                "status" => "error", 
                "message" => "Incorrect email or password. Please try again."
            ]);
        }
    } catch (Exception $e) {
        debug_log("Exception: " . $e->getMessage());
        // Set response code - 500 internal server error
        http_response_code(500);
        
        // Return more user-friendly error response
        echo json_encode([
            "status" => "error", 
            "message" => "A server error occurred. Please try again later.",
            "debug" => $e->getMessage() // Include for debugging but would remove in production
        ]);
    }
} else {
    debug_log("Required fields missing");
    debug_log("Email: " . (isset($data->email) ? $data->email : 'missing'));
    debug_log("Password: " . (isset($data->password) ? 'provided' : 'missing'));
    // Set response code - 400 bad request
    http_response_code(400);
    
    // Return more descriptive error response
    echo json_encode([
        "status" => "error", 
        "message" => "Please provide both email and password to login."
    ]);
}
?> 