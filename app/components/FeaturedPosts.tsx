'use client';

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Button,
  useColorModeValue,
  Flex,
  Divider,
  HStack,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaFire, FaRegClock } from 'react-icons/fa';
import NextLink from 'next/link';
import PostCard from './PostCard';
import { useState, useEffect } from 'react';
import API_ENDPOINTS from '../config/api';

// Define the Post interface that matches what we get from the API
interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  category: string;
  institution: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments_count: number;
  comments?: any[]; // Optional comments array
  user: User;
}

export default function FeaturedPosts() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to load the data on the client side only
  useEffect(() => {
    setMounted(true);
    
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getRecentPosts(3));
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Recent posts response:', data);
        if (data.status === 'success') {
          setRecentPosts(data.posts || []);
        } else {
          throw new Error(data.message || 'Failed to load recent posts');
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setError('Failed to load recent posts');
      }
    };

    const fetchTrendingPosts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getTrendingPosts(3));
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Trending posts response:', data);
        if (data.status === 'success') {
          setTrendingPosts(data.posts || []);
        } else {
          throw new Error(data.message || 'Failed to load trending posts');
        }
      } catch (error) {
        console.error('Error fetching trending posts:', error);
        setError('Failed to load trending posts');
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRecentPosts(), fetchTrendingPosts()]);
      setIsLoading(false);
    };

    loadData();
    
    return () => {
      // Cleanup function
    };
  }, []);

  // Loading skeleton for posts
  const PostSkeleton = () => (
    <Box p={4} boxShadow="md" borderRadius="lg" borderWidth="1px" bg="white" height="300px">
      <Skeleton height="150px" mb={4} />
      <Skeleton height="30px" width="70%" mb={2} />
      <Skeleton height="20px" width="90%" mb={2} />
      <Skeleton height="20px" width="80%" mb={4} />
      <Flex justify="space-between">
        <Skeleton height="30px" width="120px" />
        <Skeleton height="30px" width="80px" />
      </Flex>
    </Box>
  );

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Box bg={bgColor} py={16}>
        <Container maxW="7xl">
          <Skeleton height="40px" width="200px" mb={8} />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} py={16}>
      <Container maxW="7xl">
        <VStack spacing={16}>
          {/* Recent Posts Section */}
          <Box width="100%">
            <Flex justify="space-between" align="center" mb={8}>
              <HStack>
                <Icon as={FaRegClock} color="blue.500" boxSize={5} />
                <Heading size="lg">Recent Reports</Heading>
              </HStack>
              <Button
                as={NextLink}
                href="/posts"
                variant="outline"
                colorScheme="blue"
                rightIcon={<ChevronRightIcon />}
                size="sm"
              >
                View All
              </Button>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : error ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              ) : recentPosts.length === 0 ? (
                <Text>No recent posts found.</Text>
              ) : (
                recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </SimpleGrid>
          </Box>
          
          <Divider />
          
          {/* Trending Posts Section */}
          <Box width="100%">
            <Flex justify="space-between" align="center" mb={8}>
              <HStack>
                <Icon as={FaFire} color="red.500" boxSize={5} />
                <Heading size="lg">Trending Reports</Heading>
              </HStack>
              <Text color="gray.500" fontSize="sm">
                Most impactful stories
              </Text>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : error ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              ) : trendingPosts.length === 0 ? (
                <Text>No trending posts found.</Text>
              ) : (
                trendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </SimpleGrid>
          </Box>
          
          {/* Call to Action */}
          <Box 
            bgGradient="linear(to-r, blue.400, purple.500)" 
            p={8} 
            borderRadius="lg" 
            color="white"
            width="100%"
            textAlign="center"
            boxShadow="xl"
          >
            <VStack spacing={4}>
              <Heading size="lg">Share Your Experience</Heading>
              <Text fontSize="md" maxW="xl">
                Your story can help others who may be facing similar situations. By sharing, you contribute to creating awareness and building a safer community.
              </Text>
              <Button 
                as={NextLink}
                href="/posts/create"
                colorScheme="whiteAlpha" 
                size="lg"
                _hover={{ bg: 'white', color: 'blue.500' }}
                mt={4}
              >
                Share Now
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 