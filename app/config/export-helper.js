// This file is NOT part of the runtime app
// It's a helper for generating static page params

/**
 * Generator for dynamic routes that returns dummy IDs
 * for static site generation
 */
export function generateDummyParams(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
  }));
} 