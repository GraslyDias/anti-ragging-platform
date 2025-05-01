# Uploads Directory

This directory is used to store uploaded files for the anti-ragging platform.

## Structure

- `/posts` - Images uploaded for posts
- `/profiles` - Profile pictures for users

## Important

Make sure this directory and its subdirectories are writable by the web server.

```bash
# Example permission setting on Linux/Unix
chmod -R 755 uploads
chmod -R 775 uploads/posts
chmod -R 775 uploads/profiles
```

On Windows with XAMPP, ensure the Apache user has write permissions to these directories. 