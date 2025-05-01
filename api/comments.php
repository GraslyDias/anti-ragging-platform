<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['post_id']) || !isset($data['content'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $post_id = $data['post_id'];
    $content = $data['content'];
    $user_id = $_SESSION['user_id'];

    try {
        // Verify post exists
        $stmt = $pdo->prepare("SELECT id FROM posts WHERE id = ?");
        $stmt->execute([$post_id]);
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Post not found']);
            exit;
        }

        // Insert comment
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$post_id, $user_id, $content]);
        
        echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to add comment']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?> 