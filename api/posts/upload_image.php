<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Image upload endpoint accessed");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Check if the file was uploaded without errors
if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
    debug_log("Image received: " . $_FILES["image"]["name"]);
    
    // Define allowed file types
    $allowed = ["jpg" => "image/jpg", "jpeg" => "image/jpeg", "gif" => "image/gif", "png" => "image/png"];
    
    // Get file information
    $filename = $_FILES["image"]["name"];
    $filetype = $_FILES["image"]["type"];
    $filesize = $_FILES["image"]["size"];
    
    debug_log("File details - Name: $filename, Type: $filetype, Size: $filesize");
    
    // Verify file extension
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    
    if (!array_key_exists(strtolower($ext), $allowed)) {
        debug_log("Invalid file extension: $ext");
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid file format. Only JPG, JPEG, PNG, and GIF are allowed."], JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Verify MIME type - relaxed check to handle various browser quirks
    $mimetype_allowed = false;
    foreach ($allowed as $allowed_type) {
        if (strpos($filetype, $allowed_type) !== false || 
            strpos($filetype, str_replace('image/', '', $allowed_type)) !== false) {
            $mimetype_allowed = true;
            break;
        }
    }
    
    if (!$mimetype_allowed) {
        debug_log("Invalid file type: $filetype");
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."], JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Verify file size - 5MB maximum
    $maxsize = 5 * 1024 * 1024;
    
    if ($filesize > $maxsize) {
        debug_log("File too large: $filesize bytes");
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "File size is too large. Maximum size is 5MB."], JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Create unique file name
    $new_filename = uniqid() . '.' . strtolower($ext);
    
    // Get absolute path to upload directory
    $base_dir = realpath(__DIR__ . '/../uploads/posts');
    if (!$base_dir) {
        // If directory doesn't exist, create it
        $base_dir = __DIR__ . '/../uploads/posts';
        if (!file_exists($base_dir)) {
            debug_log("Creating upload directory: $base_dir");
            if (!mkdir($base_dir, 0777, true)) {
                debug_log("Failed to create directory: $base_dir");
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to create upload directory."], JSON_UNESCAPED_SLASHES);
                exit;
            }
        }
    }
    
    // Make sure the path ends with a directory separator
    $base_dir = rtrim($base_dir, '/\\') . DIRECTORY_SEPARATOR;
    
    $file_path = $base_dir . $new_filename;
    debug_log("Attempting to save file to: $file_path");
    
    // Move uploaded file
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $file_path)) {
        // Calculate the public URL path
        $public_path = '/anti-ragging-platform/api/uploads/posts/' . $new_filename;
        debug_log("File uploaded successfully");
        debug_log("Public path: $public_path");
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            "status" => "success", 
            "message" => "File uploaded successfully",
            "file_path" => $public_path
        ], JSON_UNESCAPED_SLASHES);
    } else {
        $error = error_get_last();
        $error_msg = $error ? $error['message'] : 'Unknown error';
        debug_log("Failed to move uploaded file. PHP Error: $error_msg");
        debug_log("Temp file: " . $_FILES["image"]["tmp_name"]);
        debug_log("Target path: $file_path");
        
        // Return error response
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Failed to upload file. Please check server permissions.",
            "debug" => $error_msg
        ], JSON_UNESCAPED_SLASHES);
    }
} else {
    $error_code = isset($_FILES["image"]) ? $_FILES["image"]["error"] : "No file found";
    debug_log("File upload error: $error_code");
    
    // Return error response
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No file uploaded or file upload error: " . $error_code], JSON_UNESCAPED_SLASHES);
}
?> 