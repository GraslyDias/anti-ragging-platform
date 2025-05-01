import { useState, useEffect } from 'react';
import { Image, ImageProps, Box } from '@chakra-ui/react';
import { API_BASE } from '../config/api';

// Helper function to normalize image URLs
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  // For debugging
  const originalUrl = url;
  console.log('Original URL:', originalUrl);
  
  // Handle JSON-escaped forward slashes
  let normalizedUrl = url.replace(/\\\//g, '/');
  
  // Don't process the placeholder URL to avoid infinite loops
  if (normalizedUrl.includes('placeholder.com')) {
    return normalizedUrl;
  }
  
  // For absolute URLs (starting with http), use directly
  if (normalizedUrl.startsWith('http')) {
    console.log('Using direct URL:', normalizedUrl);
    return normalizedUrl;
  }
  
  // For relative paths that include uploads/posts
  if (normalizedUrl.includes('uploads/posts')) {
    // Extract the filename from the path
    const filename = normalizedUrl.split('/').pop();
    if (filename) {
      // Use the direct_image.php script with the filename
      const directUrl = `${API_BASE}/anti-ragging-platform/api/direct_image.php?filename=${encodeURIComponent(filename)}`;
      console.log('Using direct_image.php for uploads path:', originalUrl, '->', directUrl);
      return directUrl;
    }
  }
  
  // If it's just a filename, use direct_image.php
  if (!normalizedUrl.includes('/')) {
    const directUrl = `${API_BASE}/anti-ragging-platform/api/direct_image.php?filename=${encodeURIComponent(normalizedUrl)}`;
    console.log('Using direct_image.php for filename:', originalUrl, '->', directUrl);
    return directUrl;
  }
  
  // If it starts with a slash, make it absolute using API_BASE
  if (normalizedUrl.startsWith('/')) {
    // Check if it might be a file in uploads/posts
    if (normalizedUrl.includes('uploads/posts')) {
      const filename = normalizedUrl.split('/').pop();
      if (filename) {
        const directUrl = `${API_BASE}/anti-ragging-platform/api/direct_image.php?filename=${encodeURIComponent(filename)}`;
        console.log('Using direct_image.php for path with slash:', originalUrl, '->', directUrl);
        return directUrl;
      }
    }
    
    // Otherwise, just make it absolute
    normalizedUrl = `${API_BASE}${normalizedUrl}`;
    console.log('Made absolute:', originalUrl, '->', normalizedUrl);
    return normalizedUrl;
  }
  
  // For any other format, assume it's a filename and use direct_image.php
  const directUrl = `${API_BASE}/anti-ragging-platform/api/direct_image.php?filename=${encodeURIComponent(normalizedUrl)}`;
  console.log('Default handling with direct_image.php:', originalUrl, '->', directUrl);
  return directUrl;
}

// Props for ImageWithFallback component
interface ImageWithFallbackProps extends Omit<ImageProps, 'fallbackSrc'> {
  src: string;
  fallbackSrc?: string;
  alt: string;
}

// ImageWithFallback component
export default function ImageWithFallback({ 
  src, 
  fallbackSrc = 'https://via.placeholder.com/800x400?text=Image+Not+Available',
  alt,
  ...rest 
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  
  // Set the image source when the component mounts or src changes
  useEffect(() => {
    const normalizedSrc = normalizeImageUrl(src);
    console.log('Image source normalized:', src, '->', normalizedSrc);
    setImgSrc(normalizedSrc);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    // Only set fallback image if we haven't already tried it
    if (!hasError) {
      console.error('Image failed to load:', imgSrc, 'Falling back to placeholder');
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Box position="relative">
      <Image
        src={imgSrc}
        alt={alt}
        onError={handleError}
        {...rest}
      />
    </Box>
  );
} 