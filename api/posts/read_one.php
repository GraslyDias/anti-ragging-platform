<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
include_once '../database/db_connect.php';

// Get ID parameter
$id = isset($_GET['id']) ? $_GET['id'] : "";

// Check if ID is not empty
if (!empty($id)) {
    try {
        // Prepare query to get post with user info
        $query = "SELECT 
                    p.id, p.title, p.content, p.image, p.created_at, 
                    u.id as user_id, u.name as user_name
                  FROM 
                    posts p
                  INNER JOIN 
                    users u ON p.user_id = u.id
                  WHERE 
                    p.id = :id";
        
        $stmt = $conn->prepare($query);
        
        // Bind ID
        $stmt->bindParam(":id", $id);
        
        // Execute query
        $stmt->execute();
        
        // Check if post exists
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch();
            
            // Post array
            $post = [
                "id" => $row['id'],
                "title" => $row['title'],
                "content" => $row['content'],
                "image" => $row['image'],
                "created_at" => $row['created_at'],
                "user" => [
                    "id" => $row['user_id'],
                    "name" => $row['user_name']
                ]
            ];
            
            // Get comments for this post
            $comments_query = "SELECT 
                                c.id, c.content, c.created_at, 
                                u.id as user_id, u.name as user_name
                               FROM 
                                comments c
                               INNER JOIN 
                                users u ON c.user_id = u.id
                               WHERE 
                                c.post_id = :post_id
                               ORDER BY 
                                c.created_at ASC";
            
            $comments_stmt = $conn->prepare($comments_query);
            $comments_stmt->bindParam(":post_id", $id);
            $comments_stmt->execute();
            
            // Comments array
            $comments = [];
            
            // Fetch all comments
            while ($comment_row = $comments_stmt->fetch()) {
                $comments[] = [
                    "id" => $comment_row['id'],
                    "content" => $comment_row['content'],
                    "created_at" => $comment_row['created_at'],
                    "user" => [
                        "id" => $comment_row['user_id'],
                        "name" => $comment_row['user_name']
                    ]
                ];
            }
            
            // Add comments to post
            $post["comments"] = $comments;
            
            // Set response code - 200 success
            http_response_code(200);
            
            // Return success response with post
            echo json_encode([
                "status" => "success",
                "post" => $post
            ]);
        } else {
            // Set response code - 404 not found
            http_response_code(404);
            
            // Return error response
            echo json_encode(["status" => "error", "message" => "Post not found"]);
        }
    } catch (Exception $e) {
        // Set response code - 500 internal server error
        http_response_code(500);
        
        // Return error response
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);
    
    // Return error response
    echo json_encode(["status" => "error", "message" => "Post ID is required"]);
}
?> 