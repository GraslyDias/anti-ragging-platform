import { NextRequest, NextResponse } from 'next/server';

// Make this route static for export compatibility
export const dynamic = 'force-static';

// Define the base URL for the PHP backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://akf.digital/anti-ragging-platform';

/**
 * Image proxy handler
 * This fetches images from the PHP backend and serves them from the Next.js domain,
 * avoiding CORS issues
 */
export async function GET(request: NextRequest) {
  // Get the image path from the URL
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  
  // Validate the path
  if (!path) {
    console.error('Image proxy error: No path provided');
    return new NextResponse('Image path is required', { status: 400 });
  }
  
  try {
    // Construct the full URL to the image on the PHP backend
    let imageUrl = path;
    
    // Process the URL to ensure it's properly formatted
    if (path.startsWith('/')) {
      // If path is relative, prepend the API base
      imageUrl = `${API_BASE}${path}`;
    } else if (!path.startsWith('http')) {
      // If it's not an absolute URL, assume it's relative to API base
      imageUrl = `${API_BASE}/${path}`;
    }
    
    // Clean up the URL (handle double slashes, etc.)
    imageUrl = imageUrl.replace(/([^:])\/\//g, '$1/');
    
    console.log('Image proxy fetching:', imageUrl);
    
    // Fetch the image from the PHP backend
    const imageResponse = await fetch(imageUrl, {
      cache: 'no-store', // Disable caching to ensure fresh image
    });
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      return new NextResponse('Failed to fetch image', { status: imageResponse.status });
    }
    
    // Get the image data as an ArrayBuffer
    const imageData = await imageResponse.arrayBuffer();
    
    // Get the content type from the response
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    console.log('Image fetched successfully:', path, 'Content-Type:', contentType);
    
    // Create a new response with the image data
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error in image proxy:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
} 