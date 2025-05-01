'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Divider,
  SimpleGrid,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import API_ENDPOINTS from '../config/api';
import ImageWithFallback from '../components/ImageWithFallback';

// Define the Post interface that matches what we get from the API
interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  institution: string;
  created_at: string;
  updated_at: string;
  images?: string[];
  likes: number;
  comments_count: number;
  user: User;
}

export default function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);

  // Color mode values
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const skeletonStartColor = useColorModeValue('gray.100', 'gray.700');
  const skeletonEndColor = useColorModeValue('gray.400', 'gray.500');

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to view your dashboard',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      router.push('/auth/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser({
        id: userData.id,
        name: userData.name || 'User',
      });

      // Fetch the user's posts from the API
      const fetchUserPosts = async (userId: number) => {
        setIsLoading(true);
        setIsError(false);

        try {
          console.log('Fetching posts for user:', userId);
          const response = await fetch(API_ENDPOINTS.getUserPosts(userId));
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API response:', data);
          
          if (data.status === 'success') {
            // Enhanced debugging to understand image data better
            if (data.posts && data.posts.length > 0) {
              data.posts.forEach((post: Post, idx: number) => {
                console.log(`Post ${idx + 1} (ID: ${post.id}) info:`, {
                  title: post.title,
                  imageCount: post.images ? post.images.length : 0
                });
                
                if (post.images && post.images.length > 0) {
                  console.log(`Image URLs for post ${post.id}:`, post.images);
                }
              });
            }
            
            setUserPosts(data.posts || []);
          } else {
            throw new Error(data.message || 'Failed to fetch posts');
          }
        } catch (error) {
          console.error('Error fetching user posts:', error);
          setIsError(true);
          toast({
            title: 'Error loading posts',
            description: 'Could not load your posts. Please try again later.',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          });
        } finally {
        setIsLoading(false);
        }
      };

      if (userData.id) {
        fetchUserPosts(userData.id);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }, [router, toast]);

  const handleCreatePost = () => {
    router.push('/posts/create');
  };

  const handleViewPost = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  // Loading skeleton for dashboard
  const PostSkeleton = () => (
    <Box 
      p={4} 
      boxShadow="md" 
      borderRadius="lg" 
      borderWidth="1px" 
      height="200px"
      bg={cardBgColor}
      borderColor={cardBorderColor}
    >
      <Skeleton 
        height="30px" 
        width="60%" 
        mb={4}
        startColor={skeletonStartColor}
        endColor={skeletonEndColor}
      />
      <Skeleton 
        height="20px" 
        width="90%" 
        mb={2}
        startColor={skeletonStartColor}
        endColor={skeletonEndColor}
      />
      <Skeleton 
        height="20px" 
        width="80%" 
        mb={4}
        startColor={skeletonStartColor}
        endColor={skeletonEndColor}
      />
      <Flex justify="space-between">
        <Skeleton 
          height="30px" 
          width="120px"
          startColor={skeletonStartColor}
          endColor={skeletonEndColor}
        />
        <Skeleton 
          height="30px" 
          width="80px"
          startColor={skeletonStartColor}
          endColor={skeletonEndColor}
        />
      </Flex>
    </Box>
  );

  return (
    <Box bg={pageBgColor} minH="100vh">
      <Navbar />
      <Container maxW={'7xl'} py={12}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb={8}
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          <Stack>
            <Heading 
              as="h1" 
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              color={headingColor}
            >
              Your Dashboard
            </Heading>
            <Text color={mutedTextColor} fontWeight="medium">
              Manage your stories and see your contributions
            </Text>
          </Stack>
          <Button 
            colorScheme="blue" 
            size="md" 
            onClick={handleCreatePost}
          >
            Share New Story
          </Button>
        </Flex>

        <Divider mb={8} borderColor={dividerColor} />

        <Box>
          <Heading 
            as="h2" 
            size="lg" 
            mb={6}
            color={headingColor}
          >
            Your Stories
          </Heading>

          {isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <PostSkeleton />
              <PostSkeleton />
            </SimpleGrid>
          ) : isError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text color={textColor}>There was an error loading your posts. Please try again later.</Text>
            </Alert>
          ) : userPosts.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text color={textColor}>You haven't shared any stories yet. Share your experience to help others.</Text>
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {userPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    category: post.category as "physical" | "verbal" | "psychological" | "other",
                    institution: post.institution,
                    created_at: post.created_at,
                    images: post.images,
                    likes: post.likes,
                    user: post.user
                  }}
                  onClick={() => handleViewPost(post.id)}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>
    </Box>
  );
} 