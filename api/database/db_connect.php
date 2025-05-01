<?php
// Debug function if not already defined
if (!function_exists('debug_log')) {
    function debug_log($message) {
        $log_file = __DIR__ . '/../debug.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
    }
}

// Database configuration
$host = "localhost";
$dbname = "anti_ragging_db";
$username = "root";
$password = "Imesh2001@";

debug_log("Attempting database connection to {$dbname} on {$host}");

// Create a connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    debug_log("Database connection successful");
} catch(PDOException $e) {
    debug_log("Database connection failed: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit;
}
?> 