<?php
// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Get post endpoint accessed");

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
include_once '../database/db_connect.php';

// Check if post ID is provided
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $post_id = $_GET['id'];
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    debug_log("Fetching post with ID: " . $post_id);
    if ($user_id) {
        debug_log("User ID provided: " . $user_id);
    }
    
    try {
        // Get post details
        $query = "SELECT p.*, u.name as user_name 
                  FROM posts p
                  JOIN users u ON p.user_id = u.id
                  WHERE p.id = :post_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":post_id", $post_id);
        $stmt->execute();
        
        // Check if post exists
        if ($stmt->rowCount() > 0) {
            $post = $stmt->fetch();
            debug_log("Post found: " . print_r($post, true));
            
            // Get comments for this post
            $comments_query = "SELECT c.*, u.name as user_name 
                              FROM comments c
                              JOIN users u ON c.user_id = u.id
                              WHERE c.post_id = :post_id
                              ORDER BY c.created_at ASC";
            $comments_stmt = $conn->prepare($comments_query);
            $comments_stmt->bindParam(":post_id", $post_id);
            $comments_stmt->execute();
            
            $comments = [];
            while ($comment = $comments_stmt->fetch()) {
                $comments[] = [
                    "id" => $comment['id'],
                    "content" => $comment['content'],
                    "created_at" => $comment['created_at'],
                    "user" => [
                        "id" => $comment['user_id'],
                        "name" => $comment['user_name']
                    ]
                ];
            }
            
            debug_log("Found " . count($comments) . " comments");
            
            // Get like count for the post
            $likes_query = "SELECT COUNT(*) as count FROM likes WHERE post_id = :post_id";
            $likes_stmt = $conn->prepare($likes_query);
            $likes_stmt->bindParam(":post_id", $post_id);
            $likes_stmt->execute();
            $likes_count = $likes_stmt->fetch()['count'];
            
            debug_log("Post has " . $likes_count . " likes");
            
            // Check if current user has liked the post
            $user_liked = false;
            if ($user_id) {
                $user_like_query = "SELECT COUNT(*) as liked FROM likes WHERE post_id = :post_id AND user_id = :user_id";
                $user_like_stmt = $conn->prepare($user_like_query);
                $user_like_stmt->bindParam(":post_id", $post_id);
                $user_like_stmt->bindParam(":user_id", $user_id);
                $user_like_stmt->execute();
                $user_liked = (bool)$user_like_stmt->fetch()['liked'];
                
                debug_log("User has " . ($user_liked ? "" : "not ") . "liked the post");
            }
            
            // Process images (stored as JSON string)
            $images = [];
            if (!empty($post['images'])) {
                // Log the raw images data
                debug_log("Raw images data: " . $post['images']);
                
                try {
                    // Try to decode the JSON
                    $decoded_images = json_decode($post['images'], true);
                    
                    if ($decoded_images === null && json_last_error() !== JSON_ERROR_NONE) {
                        debug_log("JSON decode error: " . json_last_error_msg());
                        // If JSON decode fails, check if it's a single image path
                        if (is_string($post['images']) && trim($post['images']) !== '') {
                            $images = [trim($post['images'])];
                            debug_log("Treating as single image: " . $post['images']);
                        }
                    } else {
                        // Handle different possible formats
                        if (is_array($decoded_images)) {
                            $images = $decoded_images;
                            debug_log("Decoded as array with " . count($images) . " images");
                        } elseif (is_string($decoded_images)) {
                            $images = [$decoded_images];
                            debug_log("Decoded as string: " . $decoded_images);
                        } else {
                            debug_log("Unexpected format after JSON decode: " . gettype($decoded_images));
                        }
                    }
                    
                    // Make sure URLs are correctly formatted
                    $formatted_images = [];
                    foreach ($images as $img) {
                        if (is_string($img) && trim($img) !== '') {
                            // If URL starts with http:// or https://, use as is
                            if (preg_match('/^https?:\/\//', $img)) {
                                $formatted_images[] = $img;
                                debug_log("Using absolute URL: " . $img);
                            } 
                            // If URL starts with /, assume it's a relative path from webroot
                            else if (strpos($img, '/') === 0) {
                                $formatted_images[] = $img;
                                debug_log("Using relative URL: " . $img);
                            }
                            // Otherwise, assume it's a path from uploads folder
                            else {
                                $formatted_images[] = '/anti-ragging-platform/api/uploads/posts/' . $img;
                                debug_log("Converting to full path: " . '/anti-ragging-platform/api/uploads/posts/' . $img);
                            }
                        }
                    }
                    
                    $images = $formatted_images;
                    debug_log("Final images array: " . print_r($images, true));
                } catch (Exception $e) {
                    debug_log("Error processing images: " . $e->getMessage());
                }
            } else {
                debug_log("No images found in post data");
            }
            
            // Create response
            $response = [
                "status" => "success",
                "post" => [
                    "id" => $post['id'],
                    "title" => $post['title'],
                    "content" => $post['content'],
                    "category" => $post['category'],
                    "institution" => $post['institution'],
                    "created_at" => $post['created_at'],
                    "updated_at" => $post['updated_at'],
                    "images" => $images,
                    "likes" => $likes_count,
                    "user_liked" => $user_liked,
                    "user" => [
                        "id" => $post['user_id'],
                        "name" => $post['user_name']
                    ],
                    "comments" => $comments
                ]
            ];
            
            // Set response code - 200 success
            http_response_code(200);
            
            // Ensure proper JSON encoding without escaped slashes
            $json_response = json_encode($response, JSON_UNESCAPED_SLASHES);
            debug_log("Final JSON response: " . (strlen($json_response) > 500 ? substr($json_response, 0, 500) . "..." : $json_response));
            
            // Return success response
            echo $json_response;
        } else {
            // Set response code - 404 not found
            debug_log("Post not found with ID: " . $post_id);
            http_response_code(404);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "Post not found"], JSON_UNESCAPED_SLASHES);
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
    debug_log("No post ID provided");
    http_response_code(400);
    
    // Return error response
    echo json_encode(["status" => "error", "message" => "Post ID is required"], JSON_UNESCAPED_SLASHES);
}
?> 