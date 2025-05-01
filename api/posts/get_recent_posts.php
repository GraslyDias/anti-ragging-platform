<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Get recent posts endpoint accessed");

// Include database connection
include_once '../database/db_connect.php';

try {
    // Get limit parameter (default to 3)
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 3;
    
    // Validate limit
    if ($limit <= 0) {
        $limit = 3;
    }
    
    debug_log("Fetching {$limit} recent posts");
    
    // Prepare query to get most recent posts with user info
    $query = "SELECT 
                p.id, p.title, p.content, p.images, p.category, p.institution, p.created_at, p.updated_at,
                u.id as user_id, u.name as user_name
              FROM 
                posts p
              INNER JOIN 
                users u ON p.user_id = u.id
              ORDER BY 
                p.created_at DESC
              LIMIT :limit";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    
    // Execute query
    $stmt->execute();
    
    // Check if there are posts
    if ($stmt->rowCount() > 0) {
        // Posts array
        $posts = [];
        
        // Fetch all posts
        while ($row = $stmt->fetch()) {
            // Process images (stored as JSON string)
            $images = [];
            if (!empty($row['images'])) {
                debug_log("Processing images for post " . $row['id'] . ": " . $row['images']);
                try {
                    // Try to decode the JSON
                    $decoded_images = json_decode($row['images'], true);
                    
                    if ($decoded_images === null && json_last_error() !== JSON_ERROR_NONE) {
                        debug_log("JSON decode error: " . json_last_error_msg());
                        if (is_string($row['images']) && trim($row['images']) !== '') {
                            $images = [trim($row['images'])];
                        }
                    } else {
                        if (is_array($decoded_images)) {
                            $images = $decoded_images;
                        } elseif (is_string($decoded_images)) {
                            $images = [$decoded_images];
                        }
                    }
                    
                    // Format image URLs - just return filenames for simplicity
                    $formatted_images = [];
                    foreach ($images as $img) {
                        if (is_string($img) && trim($img) !== '') {
                            // Extract just the filename, regardless of path format
                            if (strpos($img, '/') !== false) {
                                $img = basename($img);
                            }
                            $formatted_images[] = $img;
                        }
                    }
                    
                    $images = $formatted_images;
                } catch (Exception $e) {
                    debug_log("Error processing images: " . $e->getMessage());
                }
            }
            
            // Get comments count for this post
            $comments_query = "SELECT COUNT(*) as count FROM comments WHERE post_id = :post_id";
            $comments_stmt = $conn->prepare($comments_query);
            $comments_stmt->bindParam(":post_id", $row['id']);
            $comments_stmt->execute();
            $comments_count = $comments_stmt->fetch()['count'];
            
            // Get likes count for this post
            $likes_query = "SELECT COUNT(*) as count FROM likes WHERE post_id = :post_id";
            $likes_stmt = $conn->prepare($likes_query);
            $likes_stmt->bindParam(":post_id", $row['id']);
            $likes_stmt->execute();
            $likes_count = $likes_stmt->fetch()['count'];
            
            $posts[] = [
                "id" => $row['id'],
                "title" => $row['title'],
                "content" => $row['content'],
                "images" => $images,
                "category" => $row['category'],
                "institution" => $row['institution'],
                "created_at" => $row['created_at'],
                "updated_at" => $row['updated_at'],
                "likes" => $likes_count,
                "comments_count" => $comments_count,
                "user" => [
                    "id" => $row['user_id'],
                    "name" => $row['user_name']
                ]
            ];
        }
        
        // Set response code - 200 success
        http_response_code(200);
        
        // Return success response with posts
        echo json_encode([
            "status" => "success",
            "posts" => $posts
        ], JSON_UNESCAPED_SLASHES);
    } else {
        // Set response code - 200 success
        http_response_code(200);
        
        // Return success response with empty posts array
        echo json_encode([
            "status" => "success",
            "posts" => []
        ], JSON_UNESCAPED_SLASHES);
    }
} catch (Exception $e) {
    // Set response code - 500 internal server error
    http_response_code(500);
    debug_log("Error in get_recent_posts.php: " . $e->getMessage());
    // Return error response
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_SLASHES);
}
?> 