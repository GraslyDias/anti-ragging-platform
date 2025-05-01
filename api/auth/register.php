<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Register endpoint accessed");

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
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->password)
) {
    try {
        debug_log("Checking if email exists: " . $data->email);
        // Check if email already exists
        $check_query = "SELECT COUNT(*) as count FROM users WHERE email = :email";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();
        $row = $check_stmt->fetch();
        
        if ($row['count'] > 0) {
            // Return error response
            debug_log("Email already exists: " . $data->email);
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email already exists"]);
            exit;
        }
        
        // Hash the password
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        debug_log("Password hashed successfully");
        
        // Prepare insert query
        $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
        debug_log("Prepared query: " . $query);
        $stmt = $conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password", $hashed_password);
        debug_log("Parameters bound");
        
        // Execute query
        if ($stmt->execute()) {
            // Set response code - 201 created
            debug_log("User registered successfully: " . $data->email);
            http_response_code(201);
            
            // Return success response
            echo json_encode(["status" => "success", "message" => "User registered successfully"]);
        } else {
            // Set response code - 503 service unavailable
            debug_log("Failed to execute query: " . print_r($stmt->errorInfo(), true));
            http_response_code(503);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "Unable to register user"]);
        }
    } catch (Exception $e) {
        // Set response code - 500 internal server error
        debug_log("Exception: " . $e->getMessage());
        http_response_code(500);
        
        // Return error response
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    // Set response code - 400 bad request
    debug_log("Required fields missing");
    debug_log("Name: " . (isset($data->name) ? $data->name : 'missing'));
    debug_log("Email: " . (isset($data->email) ? $data->email : 'missing'));
    debug_log("Password: " . (isset($data->password) ? 'provided' : 'missing'));
    http_response_code(400);
    
    // Return error response
    echo json_encode(["status" => "error", "message" => "Name, email, and password are required"]);
}
?> 