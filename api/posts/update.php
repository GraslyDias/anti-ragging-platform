<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Debug function
function debug_log($message) {
    $log_file = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

debug_log("Update post endpoint accessed");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    debug_log("OPTIONS request received");
    http_response_code(200);
    exit;
}

// Include database connection
include_once '../database/db_connect.php';

// Get posted data
$input = file_get_contents("php://input");
debug_log("Raw input received: " . $input);
$data = json_decode($input);

// Check if data is valid
if (!isset($data->post_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Post ID and user ID are required"]);
    exit;
}

// Check for required fields
if (!isset($data->title) || !isset($data->content) || !isset($data->category) || !isset($data->institution)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Title, content, category and institution are required"]);
    exit;
}

try {
    // First verify the user owns this post
    $verify_query = "SELECT id FROM posts WHERE id = :post_id AND user_id = :user_id";
    $verify_stmt = $conn->prepare($verify_query);
    $verify_stmt->bindParam(":post_id", $data->post_id);
    $verify_stmt->bindParam(":user_id", $data->user_id);
    $verify_stmt->execute();
    
    if ($verify_stmt->rowCount() === 0) {
        // User doesn't own this post or post doesn't exist
        http_response_code(403);
        debug_log("Update attempt failed: User {$data->user_id} doesn't own post {$data->post_id} or post doesn't exist");
        echo json_encode([
            "status" => "error", 
            "message" => "You don't have permission to update this post or the post doesn't exist"
        ]);
        exit;
    }
    
    // Process images if they are provided
    $images_json = null;
    if (isset($data->images) && is_array($data->images) && count($data->images) > 0) {
        $images_json = json_encode($data->images);
    }
    
    // Update the post
    $update_query = "UPDATE posts SET 
                    title = :title,
                    content = :content,
                    category = :category,
                    institution = :institution,
                    images = :images,
                    updated_at = NOW()
                    WHERE id = :post_id";
    
    $update_stmt = $conn->prepare($update_query);
    $update_stmt->bindParam(":title", $data->title);
    $update_stmt->bindParam(":content", $data->content);
    $update_stmt->bindParam(":category", $data->category);
    $update_stmt->bindParam(":institution", $data->institution);
    $update_stmt->bindParam(":images", $images_json);
    $update_stmt->bindParam(":post_id", $data->post_id);
    
    if ($update_stmt->execute()) {
        debug_log("Post {$data->post_id} updated successfully by user {$data->user_id}");
        
        // Get the updated post to return
        $get_post_query = "SELECT 
                            p.id, p.title, p.content, p.images, p.category, p.institution, p.created_at, p.updated_at,
                            u.id as user_id, u.name as user_name 
                        FROM posts p
                        INNER JOIN users u ON p.user_id = u.id
                        WHERE p.id = :post_id";
        
        $get_post_stmt = $conn->prepare($get_post_query);
        $get_post_stmt->bindParam(":post_id", $data->post_id);
        $get_post_stmt->execute();
        
        $post = $get_post_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Process post images
        $images = [];
        if (!empty($post['images'])) {
            try {
                $decoded_images = json_decode($post['images'], true);
                
                if ($decoded_images === null && json_last_error() !== JSON_ERROR_NONE) {
                    if (is_string($post['images']) && trim($post['images']) !== '') {
                        $images = [trim($post['images'])];
                    }
                } else {
                    if (is_array($decoded_images)) {
                        $images = $decoded_images;
                    } elseif (is_string($decoded_images)) {
                        $images = [$decoded_images];
                    }
                }
            } catch (Exception $e) {
                debug_log("Error processing images: " . $e->getMessage());
            }
        }
        
        // Get comments count
        $comments_query = "SELECT COUNT(*) as count FROM comments WHERE post_id = :post_id";
        $comments_stmt = $conn->prepare($comments_query);
        $comments_stmt->bindParam(":post_id", $data->post_id);
        $comments_stmt->execute();
        $comments_count = $comments_stmt->fetch()['count'];
        
        // Get likes count
        $likes_query = "SELECT COUNT(*) as count FROM likes WHERE post_id = :post_id";
        $likes_stmt = $conn->prepare($likes_query);
        $likes_stmt->bindParam(":post_id", $data->post_id);
        $likes_stmt->execute();
        $likes_count = $likes_stmt->fetch()['count'];
        
        // Format post for response
        $formatted_post = [
            "id" => $post['id'],
            "title" => $post['title'],
            "content" => $post['content'],
            "images" => $images,
            "category" => $post['category'],
            "institution" => $post['institution'],
            "created_at" => $post['created_at'],
            "updated_at" => $post['updated_at'],
            "likes" => $likes_count,
            "comments_count" => $comments_count,
            "user" => [
                "id" => $post['user_id'],
                "name" => $post['user_name']
            ]
        ];
        
        http_response_code(200);
        echo json_encode([
            "status" => "success", 
            "message" => "Post updated successfully",
            "post" => $formatted_post
        ]);
    } else {
        debug_log("Failed to update post: " . print_r($update_stmt->errorInfo(), true));
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Failed to update post"
        ]);
    }
} catch (Exception $e) {
    debug_log("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "A server error occurred. Please try again later.",
        "debug" => $e->getMessage()
    ]);
}
?> 