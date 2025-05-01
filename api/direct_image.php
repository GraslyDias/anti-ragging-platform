<?php
// Include CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Direct image access script started");

// Get the filename from the query parameter
$filename = isset($_GET['filename']) ? trim($_GET['filename']) : null;

if (!$filename) {
    debug_log("No filename provided");
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No filename provided"], JSON_UNESCAPED_SLASHES);
    exit;
}

// For security, sanitize the filename
$filename = basename($filename);
debug_log("Sanitized filename: $filename");

// Build the full path to the file in the uploads directory
$full_path = __DIR__ . '/uploads/posts/' . $filename;
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