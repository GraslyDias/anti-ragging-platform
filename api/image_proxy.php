<?php
// Include CORS headers
include_once 'cors_headers.php';

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Image proxy accessed");

// Get the path parameter
$path = isset($_GET['path']) ? $_GET['path'] : null;

if (!$path) {
    debug_log("No path provided");
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No image path provided"], JSON_UNESCAPED_SLASHES);
    exit;
}

// For security, only allow access to files in the uploads directory
if (strpos($path, 'uploads') === false) {
    debug_log("Invalid path, must be in uploads directory: $path");
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Invalid path"], JSON_UNESCAPED_SLASHES);
    exit;
}

// Build the full path
$full_path = __DIR__ . '/' . $path;
debug_log("Trying to serve image: $full_path");

// Check if file exists
if (!file_exists($full_path)) {
    debug_log("File not found: $full_path");
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Image not found"], JSON_UNESCAPED_SLASHES);
    exit;
}

// Get file extension for content type
$ext = strtolower(pathinfo($full_path, PATHINFO_EXTENSION));
$content_type = 'application/octet-stream';

switch ($ext) {
    case 'jpg':
    case 'jpeg':
        $content_type = 'image/jpeg';
        break;
    case 'png':
        $content_type = 'image/png';
        break;
    case 'gif':
        $content_type = 'image/gif';
        break;
    case 'webp':
        $content_type = 'image/webp';
        break;
}

// Add caching headers
header('Cache-Control: public, max-age=86400'); // Cache for 24 hours
header('Content-Type: ' . $content_type);
header('Content-Length: ' . filesize($full_path));

debug_log("Serving image with content type: $content_type");

// Output the file
readfile($full_path);
debug_log("Image served successfully");
exit; 