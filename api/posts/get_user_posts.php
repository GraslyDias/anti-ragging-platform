<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Get user posts endpoint accessed");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    debug_log("OPTIONS request received");
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
include_once '../database/db_connect.php';

// Check if user ID is provided
if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
    $user_id = $_GET['user_id'];
    debug_log("Fetching posts for user ID: " . $user_id);
    
    // Check if only count is requested
    $count_only = isset($_GET['count_only']) && ($_GET['count_only'] == '1' || $_GET['count_only'] == 'true');
    
    if ($count_only) {
        debug_log("Count only mode requested");
        try {
            // Get count of posts created by the user
            $query = "SELECT COUNT(*) as post_count FROM posts WHERE user_id = :user_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $post_count = $result['post_count'] ?? 0;
            
            debug_log("User $user_id has $post_count posts");
            
            // Set response code - 200 success
            http_response_code(200);
            
            // Return success response with post count
            echo json_encode([
                "status" => "success",
                "count" => $post_count
            ], JSON_UNESCAPED_SLASHES);
            exit;
        } catch (Exception $e) {
            // Set response code - 500 internal server error
            debug_log("Exception in count mode: " . $e->getMessage());
            http_response_code(500);
            
            // Return error response
            echo json_encode([
                "status" => "error", 
                "message" => "Failed to get post count",
                "debug" => $e->getMessage()
            ], JSON_UNESCAPED_SLASHES);
            exit;
        }
    }
    
    try {
        // Get posts created by the user
        $query = "SELECT p.*, u.name as user_name 
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.user_id = :user_id
                 ORDER BY p.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        // Check if any posts exist
        if ($stmt->rowCount() > 0) {
            $user_posts = array();
            
            while ($post = $stmt->fetch()) {
                // Process images (stored as JSON string)
                $images = [];
                if (!empty($post['images'])) {
                    debug_log("Processing images for post " . $post['id'] . ": " . $post['images']);
                    
                    try {
                        // Try to decode the JSON
                        $decoded_images = json_decode($post['images'], true);
                        
                        if ($decoded_images === null && json_last_error() !== JSON_ERROR_NONE) {
                            debug_log("JSON decode error: " . json_last_error_msg());
                            if (is_string($post['images']) && trim($post['images']) !== '') {
                                $images = [trim($post['images'])];
                                debug_log("Using raw string as image: " . $post['images']);
                            }
                        } else {
                            debug_log("Successfully decoded JSON images");
                            if (is_array($decoded_images)) {
                                $images = $decoded_images;
                                debug_log("Decoded as array: " . json_encode($images));
                            } elseif (is_string($decoded_images)) {
                                $images = [$decoded_images];
                                debug_log("Decoded as string: " . $decoded_images);
                            }
                        }
                        
                        // Format image URLs - just return filenames for simplicity
                        $formatted_images = [];
                        foreach ($images as $img) {
                            if (is_string($img) && trim($img) !== '') {
                                $original_img = $img;
                                
                                // Extract just the filename, regardless of path format
                                if (strpos($img, '/') !== false) {
                                    // Get the filename from a path
                                    $img = basename($img);
                                    debug_log("Using only filename: $original_img -> $img");
                                }
                                
                                // Just add the plain filename - front-end will handle the full path
                                $formatted_images[] = $img;
                                debug_log("Image filename for front-end: $img");
                            }
                        }
                        
                        $images = $formatted_images;
                        debug_log("Final image filenames: " . json_encode($images));
                    } catch (Exception $e) {
                        debug_log("Error processing images: " . $e->getMessage());
                    }
                }
                
                // Get comments count for this post
                $comments_query = "SELECT COUNT(*) as count FROM comments WHERE post_id = :post_id";
                $comments_stmt = $conn->prepare($comments_query);
                $comments_stmt->bindParam(":post_id", $post['id']);
                $comments_stmt->execute();
                $comments_count = $comments_stmt->fetch()['count'];
                
                // Get likes count for this post
                $likes_query = "SELECT COUNT(*) as count FROM likes WHERE post_id = :post_id";
                $likes_stmt = $conn->prepare($likes_query);
                $likes_stmt->bindParam(":post_id", $post['id']);
                $likes_stmt->execute();
                $likes_count = $likes_stmt->fetch()['count'];
                
                // Build the post data
                $post_data = [
                    "id" => $post['id'],
                    "title" => $post['title'],
                    "content" => $post['content'],
                    "category" => $post['category'],
                    "institution" => $post['institution'],
                    "created_at" => $post['created_at'],
                    "updated_at" => $post['updated_at'],
                    "images" => $images,
                    "likes" => $likes_count,
                    "comments_count" => $comments_count,
                    "user" => [
                        "id" => $post['user_id'],
                        "name" => $post['user_name']
                    ]
                ];
                
                array_push($user_posts, $post_data);
            }
            
            debug_log("Found " . count($user_posts) . " posts for user");
            
            // Set response code - 200 success
            http_response_code(200);
            
            // Return success response with posts
            echo json_encode([
                "status" => "success",
                "posts" => $user_posts
            ], JSON_UNESCAPED_SLASHES);
        } else {
            debug_log("No posts found for user ID: " . $user_id);
            
            // Set response code - 200 success (empty result is not an error)
            http_response_code(200);
            
            // Return success response with empty posts array
            echo json_encode([
                "status" => "success",
                "posts" => []
            ], JSON_UNESCAPED_SLASHES);
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
    debug_log("No user ID provided");
    http_response_code(400);
    
    // Return error response
    echo json_encode(["status" => "error", "message" => "User ID is required"], JSON_UNESCAPED_SLASHES);
}
?> 