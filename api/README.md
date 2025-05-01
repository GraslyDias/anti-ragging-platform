# Anti-Ragging Platform Backend API

This is the PHP backend API for the Anti-Ragging Platform application.

## Database Setup

1. Import the database schema from `database/schema.sql`
2. Update the database configuration in `database/db_connect.php` if needed

## API Endpoints

### Authentication

- `POST /api/auth/register.php` - Register a new user
  - Required fields: `name`, `email`, `password`
  
- `POST /api/auth/login.php` - Login a user
  - Required fields: `email`, `password`
  
### Posts

- `GET /api/posts/read.php` - Get all posts
  
- `GET /api/posts/read_one.php?id={post_id}` - Get a single post with comments
  - Required parameter: `id`
  
- `POST /api/posts/create.php` - Create a new post
  - Required fields: `user_id`, `title`, `content`
  - Optional field: `image`
  
- `POST /api/posts/upload_image.php` - Upload an image for a post
  - Required field: `image` (form-data)
  
### Comments

- `POST /api/comments/create.php` - Add a comment to a post
  - Required fields: `post_id`, `user_id`, `content`
  
## Requirements

- PHP 7.4+
- MySQL 5.7+
- PDO Extension
- File Upload Configuration (for image uploads) 