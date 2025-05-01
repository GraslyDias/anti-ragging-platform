// API Configuration
const DEV_API_URL = 'https://akf.digital/anti-ragging-platform';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEV_API_URL;

// Log the API URL in development
if (process.env.NODE_ENV !== 'production') {
  console.log('API Base URL:', API_BASE_URL);
}

// Export the base URL so it can be used for image URLs elsewhere
export const API_BASE = API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  register: `${API_BASE_URL}/api/auth/register.php`,
  login: `${API_BASE_URL}/api/auth/login.php`,
  updateProfile: `${API_BASE_URL}/api/auth/update_profile.php`,
  changePassword: `${API_BASE_URL}/api/auth/change_password.php`,
  
  // Posts endpoints
  createPost: `${API_BASE_URL}/api/posts/create.php`,
  uploadImage: `${API_BASE_URL}/api/posts/upload_image.php`,
  getAllPosts: `${API_BASE_URL}/api/posts/read.php`,
  getPost: (id: number | string) => `${API_BASE_URL}/api/posts/get.php?id=${id}`,
  getUserPosts: (userId: number | string) => `${API_BASE_URL}/api/posts/get_user_posts.php?user_id=${userId}`,
  toggleLike: `${API_BASE_URL}/api/posts/toggle_like.php`,
  getRecentPosts: (limit: number = 3) => `${API_BASE_URL}/api/posts/get_recent_posts.php?limit=${limit}`,
  getTrendingPosts: (limit: number = 3) => `${API_BASE_URL}/api/posts/get_trending_posts.php?limit=${limit}`,
  deletePost: `${API_BASE_URL}/api/posts/delete.php`,
  updatePost: `${API_BASE_URL}/api/posts/update.php`,
  getStats: `${API_BASE_URL}/api/stats/get_stats.php`,
  
  // Comments endpoints
  createComment: `${API_BASE_URL}/api/comments/create.php`,
  deleteComment: `${API_BASE_URL}/api/comments/delete.php`,
  
  // Others can be added as needed
};

export default API_ENDPOINTS; 