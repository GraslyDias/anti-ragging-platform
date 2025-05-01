'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  HStack,
  Divider,
  Image,
  Button,
  Textarea,
  FormControl,
  useColorModeValue,
  Flex,
  Badge,
  IconButton,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  Card,
  CardBody,
  Skeleton,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, ChatIcon, ExternalLinkIcon, EmailIcon, EditIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaFistRaised, FaShareAlt, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import Navbar from '../../components/Navbar';
import { useRouter, useParams } from 'next/navigation';
import { dummyPosts, DummyPost, DummyComment } from '../../data/dummyData';
import NextLink from 'next/link';
import API_ENDPOINTS, { API_BASE } from '@/app/config/api';
import ImageWithFallback from '@/app/components/ImageWithFallback';

// Define Post and Comment types based on API responses
interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User;
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
  user_liked?: boolean;
  user: User;
  comments: Comment[];
}

// Modify the formatCommentTime function to better handle recent comments
function formatCommentTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'just now';
    }
    
    // If it's a recent comment (less than 2 minutes ago), show "just now"
    const diffInSeconds = (new Date().getTime() - date.getTime()) / 1000;
    if (diffInSeconds < 120) {
      return 'just now';
    }
    
    // Otherwise use formatDistanceToNow
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'recently';
  }
}

// Add this utility function to detect and highlight URLs and emails in text
const linkifyText = (text: string) => {
  if (!text) return <></>;
  
  // Regular expressions to match URLs and email addresses
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  // Combined regex to match both URLs and emails
  const combinedRegex = new RegExp(`${urlRegex.source}|${emailRegex.source}`, 'g');
  
  // Find all matches with their positions
  const matches = [];
  let match;
  while ((match = combinedRegex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      index: match.index,
      lastIndex: combinedRegex.lastIndex
    });
  }
  
  // If no matches, return the original text
  if (matches.length === 0) {
    return <>{text}</>;
  }
  
  // Create result array with text segments and links
  const result = [];
  let lastIndex = 0;
  
  matches.forEach((match, i) => {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(<span key={`text-${i}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    // Add the link (URL or email)
    if (match.text.match(emailRegex)) {
      // It's an email
      result.push(
        <Link 
          key={`link-${i}`} 
          href={`mailto:${match.text}`} 
          color="blue.500" 
          fontWeight="medium"
          textDecoration="underline"
          _hover={{ color: 'blue.600' }}
        >
          {match.text} <EmailIcon mx="2px" boxSize="0.8em" />
        </Link>
      );
    } else {
      // It's a URL
      const href = match.text.startsWith('www.') ? `http://${match.text}` : match.text;
      result.push(
        <Link 
          key={`link-${i}`} 
          href={href} 
          isExternal 
          color="blue.500" 
          fontWeight="medium"
          textDecoration="underline"
          _hover={{ color: 'blue.600' }}
        >
          {match.text}
        </Link>
      );
    }
    
    lastIndex = match.lastIndex;
  });
  
  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    result.push(<span key={`text-last`}>{text.substring(lastIndex)}</span>);
  }
  
  return <>{result}</>;
};

export default function PostDetail() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const toast = useToast();
  
  // Define all color mode values at the top of the component with improved contrast
  const boxBgColor = useColorModeValue('white', 'gray.800');
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const badgeBgColor = useColorModeValue('gray.100', 'gray.700');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const buttonHoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const menuItemBlueBgHover = useColorModeValue('blue.50', 'blue.900');
  const menuItemBlueColorHover = useColorModeValue('blue.700', 'blue.300');
  const menuItemRedBgHover = useColorModeValue('red.50', 'red.900');
  const menuItemRedColorHover = useColorModeValue('red.700', 'red.300');
  const imageContainerBgColor = useColorModeValue('gray.50', 'gray.900');
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{id: number, name: string} | null>(null);
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const { isOpen: isDeleteModalOpen, onOpen: openDeleteModal, onClose: closeDeleteModal } = useDisclosure();
  const { 
    isOpen: isDeleteCommentModalOpen, 
    onOpen: openDeleteCommentModal, 
    onClose: closeDeleteCommentModal 
  } = useDisclosure();
  
  // Check if the current user is the post owner
  const isPostOwner = userInfo && post && userInfo.id === post.user.id;

  useEffect(() => {
    // Check if user is logged in
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserInfo({
          id: userData.id || 1,
          name: userData.name || 'Guest User'
        });
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Fetch post data from API
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        let url = API_ENDPOINTS.getPost(postId);
        
        // Add user_id to request if logged in
        if (userInfo && userInfo.id) {
          url += `&user_id=${userInfo.id}`;
        }
        
        console.log('Fetching post from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          console.log('Received post data:', data.post);
          
          // Check images specifically
          if (data.post.images) {
            console.log('Images received:', data.post.images);
            console.log('Image type:', typeof data.post.images);
            console.log('First image (if any):', data.post.images[0]);
          } else {
            console.log('No images received in post data');
          }
          
          setPost(data.post);
          setLiked(data.post.user_liked || false);
        } else {
          throw new Error(data.message || 'Failed to load post');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error loading post',
          description: 'Could not load the post data. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
    setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, userInfo]);

  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Login required',
        description: 'Please login to comment on posts',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Empty comment',
        description: 'Please write something before submitting',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (post && userInfo) {
      setIsSubmittingComment(true);
      
      try {
        console.log('Submitting to:', API_ENDPOINTS.createComment);
        
        const response = await fetch(API_ENDPOINTS.createComment, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            post_id: post.id,
            user_id: userInfo.id,
        content: comment,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          // Make sure the created_at date is a valid ISO string
          const now = new Date().toISOString();
          const commentWithFormattedDate = {
            ...data.comment,
            // Force the timestamp to be the current time to ensure "just now" display
            created_at: now
          };
          
          console.log('Adding new comment with timestamp:', now);
          
          // Update the post with the new comment
      setPost({
        ...post,
            comments: [...post.comments, commentWithFormattedDate],
      });
      
      setComment('');
      
      toast({
        title: 'Comment added',
            description: data.message || 'Your comment has been posted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
            position: 'top',
          });
        } else {
          throw new Error(data.message || 'Failed to add comment');
        }
      } catch (error: any) {
        console.error('Error adding comment:', error);
        toast({
          title: 'Failed to add comment',
          description: error.message || 'An error occurred while adding your comment',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };

  // Handle supporting a post
  const handleSupport = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Login required',
        description: 'Please login to support this post',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (!post || !userInfo) return;

    try {
      setIsLiking(true);
      const response = await fetch(API_ENDPOINTS.toggleLike, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.id,
          user_id: userInfo.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Support response:', data);
      
      if (data.status === 'success') {
        // Update like count and liked status locally
    if (post) {
      setPost({
        ...post,
            likes: data.likes_count,
            user_liked: data.liked
          });
        }
        
        setLiked(data.liked);
        
        toast({
          title: data.liked ? 'Post supported' : 'Support removed',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
      } else {
        throw new Error(data.message || 'Failed to toggle support');
      }
    } catch (error: any) {
      console.error('Error toggling support:', error);
      toast({
        title: 'Failed to support post',
        description: error.message || 'An error occurred while supporting the post',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    setIsSharing(true);
    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/posts/${post.id}` : '';
    
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: post.title || 'Anti-Ragging Report',
          text: post.content.substring(0, 100) + '...' || 'Check out this ragging report',
          url: postUrl,
        });
        toast({
          title: 'Shared successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await copyToClipboard(postUrl);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fall back to clipboard if share fails
      await copyToClipboard(postUrl);
    } finally {
      setIsSharing(false);
    }
  };

  // Helper function to copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Link copied',
        description: 'Post link copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: 'Sharing failed',
        description: 'Could not copy the post link',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handlePrevImage = () => {
    if (post?.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => {
        const imagesLength = post.images?.length || 1;
        return (prev - 1 + imagesLength) % imagesLength;
      });
    }
  };

  const handleNextImage = () => {
    if (post?.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => {
        const imagesLength = post.images?.length || 1;
        return (prev + 1) % imagesLength;
      });
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (!post || !userInfo) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.deletePost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.id,
          user_id: userInfo.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: 'Post deleted',
          description: 'Your post has been deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        
        // Redirect to dashboard after deletion
        router.push('/dashboard');
      } else {
        throw new Error(data.message || 'Failed to delete post');
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Failed to delete post',
        description: error.message || 'An error occurred while deleting the post',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Handle post edit
  const handleEdit = () => {
    if (!post) return;
    router.push(`/posts/edit/${post.id}`);
  };

  // Handler for deleting a comment
  const handleDeleteComment = async () => {
    if (!userInfo || commentToDelete === null) return;
    
    setIsDeletingComment(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.deleteComment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentToDelete,
          user_id: userInfo.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Update the post state by removing the deleted comment
        if (post) {
          setPost({
            ...post,
            comments: post.comments.filter(c => c.id !== commentToDelete)
          });
        }
        
        toast({
          title: 'Comment deleted',
          description: 'Your comment has been deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } else {
        throw new Error(data.message || 'Failed to delete comment');
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Failed to delete comment',
        description: error.message || 'An error occurred while deleting your comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsDeletingComment(false);
      closeDeleteCommentModal();
      setCommentToDelete(null);
    }
  };

  // Function to open the delete comment modal
  const confirmDeleteComment = (commentId: number) => {
    setCommentToDelete(commentId);
    openDeleteCommentModal();
  };

  if (isLoading) {
    return (
      <Box bg={pageBgColor} minH="100vh">
        <Navbar />
        <Container maxW={'7xl'} py={12}>
          <Box bg={boxBgColor} p={8} borderRadius="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
            <Skeleton height="40px" width="60%" mb={6} />
            <Skeleton height="300px" mb={6} />
            <Skeleton height="20px" width="90%" mb={3} />
            <Skeleton height="20px" width="85%" mb={3} />
            <Skeleton height="20px" width="80%" mb={6} />
            <Flex justify="space-between">
              <Skeleton height="40px" width="120px" />
              <Skeleton height="40px" width="120px" />
            </Flex>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box bg={pageBgColor} minH="100vh">
        <Navbar />
        <Container maxW={'7xl'} py={12}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Post not found</AlertTitle>
            <Text color={textColor}>The post you are looking for does not exist or has been removed.</Text>
          </Alert>
          <Button
            leftIcon={<ArrowBackIcon />}
            mt={4}
            onClick={() => router.push('/posts')}
            colorScheme="blue"
          >
            Back to Reports
          </Button>
        </Container>
      </Box>
    );
  }

  // Category color mapping
  const categoryColors: Record<string, string> = {
    physical: 'red',
    verbal: 'orange',
    psychological: 'purple',
    other: 'gray'
  };

  return (
    <Box bg={pageBgColor} minH="100vh">
      <Navbar />
      <Container maxW={'7xl'} py={{ base: 6, md: 12 }}>
        <Button
          leftIcon={<ArrowBackIcon />}
          mb={8}
          variant="ghost"
          as={NextLink}
          href="/posts"
          color={textColor}
          _hover={{ bg: buttonHoverBgColor }}
        >
          Back to Reports
        </Button>
        
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          gap={{ base: 6, md: 8 }}
        >
          {/* Main content column */}
          <Stack flex={{ base: '1', lg: '3' }} spacing={6}>
            <Box 
              bg={boxBgColor} 
              p={{ base: 4, md: 8 }} 
              borderRadius="lg" 
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <HStack spacing={2} mb={4} flexWrap="wrap">
                {post.category && (
                  <Badge 
                    colorScheme={categoryColors[post.category]} 
                    variant="solid" 
                    px={2} 
                    py={1} 
                    borderRadius="full"
                    textTransform="capitalize"
                    color="white"
                  >
                    {post.category}
                  </Badge>
                )}
                {post.institution && (
                  <Badge 
                    variant="outline" 
                    colorScheme="blue"
                    px={2}
                    py={1}
                  >
                    {post.institution}
                  </Badge>
                )}
              </HStack>
              
              <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb={4} color={textColor} lineHeight="1.2" fontWeight="bold">
                {post.title}
              </Heading>
              
              <HStack spacing={4} mb={6}>
                <HStack>
                  <Avatar 
                    size="sm" 
                    name={post.user.name}
                    src={post.user.avatar || `https://via.placeholder.com/40?text=${encodeURIComponent(post.user.name.charAt(0))}`}
                    bg="blue.500"
                  />
                  <Text fontWeight="bold" color={textColor}>{post.user.name}</Text>
                </HStack>
                <Text color={mutedTextColor} fontSize="sm">
                  {format(new Date(post.created_at), 'PPP')}
                </Text>
              </HStack>
              
              {/* Post content and image section */}
              <Box mb={8}>
                {/* Format post image data correctly */}
                {(() => {
                  // Check if post has images array
                  const images = post.images || [];
                  console.log('Rendering images array:', images);
                  
                  if (!images || images.length === 0) {
                    console.log('No images to display');
                    return null;
                  }
                  
                  // Safety check: make sure we have actual string URLs and normalize them
                  const validImages = images
                    .filter(img => typeof img === 'string' && img)
                    .map(img => {
                      // Handle different image URL patterns
                      if (img.startsWith('/anti-ragging-platform')) {
                        return `http://localhost${img}`;
                      }
                      // Handle images stored as filenames only
                      else if (!img.includes('/') && !img.startsWith('http')) {
                        return `${API_BASE}/api/uploads/posts/${img}`;
                      }
                      // Handle full URLs
                      else if (img.startsWith('http')) {
                        return img;
                      }
                      // Handle relative paths
                      else {
                        return `${API_BASE}/${img}`;
                      }
                    });
                  
                  console.log('Valid images after processing:', validImages);
                  
                  if (validImages.length === 0) {
                    console.log('No valid image URLs found');
                    return null;
                  }
                  
                  // Make sure current index is in bounds
                  const safeIndex = Math.min(currentImageIndex, validImages.length - 1);
                  const currentImageUrl = validImages[safeIndex];
                  
                  console.log('Displaying image:', currentImageUrl);
                  
                  return (
                    <Box 
                      position="relative" 
                      borderRadius="md" 
                      overflow="hidden"
                      mb={6}
                      maxH={{ base: "300px", md: "500px" }}
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      {/* Use ImageWithFallback component with better error handling */}
                      <Box
                        position="relative"
                        width="100%"
                        height={{ base: "300px", md: "500px" }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={imageContainerBgColor}
                      >
                        <Image
                          src={currentImageUrl}
                          alt={post.title || "Post image"}
                          width="100%"
                          height="100%"
                          objectFit="contain"
                          fallback={
                            <Box
                              height="100%" 
                              width="100%" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                              flexDirection="column"
                              p={4}
                            >
                              <Text color="gray.500" textAlign="center">
                                Image could not be loaded
                              </Text>
                              <Text fontSize="sm" color="gray.400" mt={2} textAlign="center">
                                {currentImageUrl.substring(0, 50)}...
                              </Text>
                            </Box>
                          }
                          onError={() => {
                            console.error(`Failed to load image: ${currentImageUrl}`);
                          }}
                        />
                      </Box>
                      
                      {/* Image counter display */}
                      {validImages.length > 1 && (
                        <HStack 
                          position="absolute" 
                          bottom="4" 
                          left="0" 
                          right="0" 
                          justifyContent="center"
                          spacing={2}
                        >
                          {validImages.map((_, index) => (
                            <Box 
                              key={index}
                              h="3"
                              w="3"
                              borderRadius="full"
                              bg={index === safeIndex ? "blue.500" : "whiteAlpha.700"}
                              cursor="pointer"
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </HStack>
                      )}
                      
                      {/* Navigation arrows for multiple images */}
                      {validImages.length > 1 && (
                        <>
                          <IconButton
                            aria-label="Previous image"
                            icon={<FaChevronLeft />}
                            size="md"
                            borderRadius="full"
                            position="absolute"
                            left="4"
                            top="50%"
                            transform="translateY(-50%)"
                            onClick={handlePrevImage}
                            color={textColor}
                            bg="whiteAlpha.700"
                            _hover={{ bg: 'whiteAlpha.900' }}
                          />
                          <IconButton
                            aria-label="Next image"
                            icon={<FaChevronRight />}
                            size="md"
                            borderRadius="full"
                            position="absolute"
                            right="4"
                            top="50%"
                            transform="translateY(-50%)"
                            onClick={handleNextImage}
                            color={textColor}
                            bg="whiteAlpha.700"
                            _hover={{ bg: 'whiteAlpha.900' }}
                          />
                        </>
                      )}
                    </Box>
                  );
                })()}
                
                <Text fontSize="lg" color={textColor} whiteSpace="pre-line">
                  {linkifyText(post.content)}
                </Text>
              </Box>
              
              <Flex 
                wrap="wrap" 
                gap={3}
                justify={{ base: "center", md: "flex-start" }}
              >
                <Button
                  leftIcon={<FaFistRaised />}
                  variant={liked ? "solid" : "outline"}
                  colorScheme="blue"
                  size={{ base: "sm", md: "md" }}
                  onClick={handleSupport}
                  minW="100px"
                  fontWeight="semibold"
                >
                  {post.likes} {liked ? 'Supported' : 'Support'}
                </Button>
                
                <Button
                  leftIcon={<ChatIcon />}
                  variant="outline"
                  colorScheme="blue"
                  size={{ base: "sm", md: "md" }}
                  onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                  minW="120px"
                  fontWeight="semibold"
                >
                  {post.comments.length} Comments
                </Button>
                
                <Button
                  leftIcon={<FaShareAlt />}
                  aria-label="Share post"
                  variant="outline"
                  colorScheme="green"
                  size={{ base: "sm", md: "md" }}
                  onClick={handleShare}
                  fontWeight="semibold"
                  isLoading={isSharing}
                  loadingText="Sharing"
                >
                  Share
                </Button>
                
                {/* Post owner actions menu */}
                {isPostOwner && (
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="outline"
                      colorScheme="purple"
                      size={{ base: "sm", md: "md" }}
                      leftIcon={<SettingsIcon />}
                    >
                      Actions
                    </MenuButton>
                    <MenuList>
                      <MenuItem 
                        icon={<EditIcon />} 
                        onClick={handleEdit}
                        color="blue.500"
                        fontWeight="medium"
                        _hover={{
                          bg: menuItemBlueBgHover,
                          color: menuItemBlueColorHover
                        }}
                      >
                        Edit Post
                      </MenuItem>
                      <MenuItem 
                        icon={<DeleteIcon />} 
                        color="red.500" 
                        onClick={openDeleteModal}
                        fontWeight="medium"
                        _hover={{
                          bg: menuItemRedBgHover,
                          color: menuItemRedColorHover
                        }}
                      >
                        Delete Post
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              </Flex>
            </Box>
            
            <Box 
              id="comments-section"
              bg={boxBgColor} 
              p={{ base: 4, md: 8 }}
              borderRadius="lg" 
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading as="h3" size="md" mb={6} color={textColor} fontWeight="bold">
                Comments ({post.comments.length})
              </Heading>
              
              <VStack spacing={4} align="stretch" mb={6}>
                {post.comments.length === 0 ? (
                  <Text color={mutedTextColor} fontWeight="medium">No comments yet. Be the first to comment!</Text>
                ) : (
                  post.comments.map((comment) => {
                    // Check if the current user is the comment owner
                    const isCommentOwner = userInfo && userInfo.id === comment.user.id;
                    
                    return (
                      <Card 
                        key={comment.id} 
                        variant="outline" 
                        bg={cardBgColor}
                        borderColor={borderColor}
                        shadow="sm"
                      >
                        <CardBody>
                          <Flex justify="space-between" align="flex-start">
                            <HStack mb={2} align="center">
                              <Avatar 
                                size="xs" 
                                name={comment.user.name} 
                                src={comment.user.avatar || `https://via.placeholder.com/40?text=${encodeURIComponent(comment.user.name.charAt(0))}`}
                                bg="blue.500"
                              />
                              <Text fontWeight="bold" fontSize="sm" color={textColor}>
                                {comment.user.name}
                              </Text>
                              <Text color={mutedTextColor} fontSize="xs">
                                {formatCommentTime(comment.created_at)}
                              </Text>
                            </HStack>
                            
                            {isCommentOwner && (
                              <IconButton
                                aria-label="Delete comment"
                                icon={<FaTrash />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => confirmDeleteComment(comment.id)}
                              />
                            )}
                          </Flex>
                          <Text pl={8} color={textColor} fontWeight="normal">
                            {linkifyText(comment.content)}
                          </Text>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </VStack>
              
              <Divider mb={6} />
              
              <Heading as="h4" size="sm" mb={4} color={textColor} fontWeight="bold">
                Leave a comment
              </Heading>
              
              <FormControl mb={4}>
                <Textarea
                  placeholder="Write your comment here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  isDisabled={!isLoggedIn}
                  bg={inputBgColor}
                  border="1px solid"
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  _hover={{
                    borderColor: "blue.300",
                  }}
                  resize="vertical"
                  minH="100px"
                />
              </FormControl>
              
              <Flex justify="flex-end">
                <Button
                  colorScheme="blue"
                  onClick={handleSubmitComment}
                  isDisabled={!isLoggedIn || !comment.trim()}
                  isLoading={isSubmittingComment}
                  loadingText="Submitting..."
                  size={{ base: "md", md: "md" }}
                  fontWeight="semibold"
                >
                  Submit
                </Button>
              </Flex>
              
              {!isLoggedIn && (
                <Alert status="info" mt={4} borderRadius="md">
                  <AlertIcon />
                  Please <Button as={NextLink} href="/auth/login" variant="link" colorScheme="blue" fontWeight="bold">login</Button> to leave a comment.
                </Alert>
              )}
            </Box>
          </Stack>
          
          {/* Sidebar */}
          <Box flex={{ base: '1', lg: '1' }}>
            <Box
              bg={boxBgColor} 
              p={{ base: 4, md: 6 }}
              borderRadius="lg" 
              boxShadow="md"
              position="sticky"
              top="100px"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading as="h3" size="md" mb={6} color={textColor} fontWeight="bold">
                Support Resources
              </Heading>
              
              <VStack align="start" spacing={5}>
                <Box>
                  <Text fontWeight="bold" mb={1} color={textColor}>
                    UGC Anti-Ragging Hotline
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Emergency hotline: <Link href="tel:0112123700" color="blue.500">011-2123700</Link>
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Report ragging incidents immediately to this dedicated 24-hour hotline.
                  </Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={1} color={textColor}>Ministry of Higher Education</Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Phone: <Link href="tel:0112694486" color="blue.500">011-2694486</Link> / <Link href="tel:0112697133" color="blue.500">011-2697133</Link>
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Email: <Link href="mailto:info@mohe.gov.lk" color="blue.500">info@mohe.gov.lk</Link>
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    18, Ward Place, Colombo 07, Sri Lanka
                  </Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={1} color={textColor}>Mental Health Support</Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Sri Lanka Sumithrayo: <Link href="tel:0112682535" color="blue.500">011-2682535</Link> / <Link href="tel:0707308308" color="blue.500">0707-308308</Link>
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Email: <Link href="mailto:slssumithrayo@gmail.com" color="blue.500">slssumithrayo@gmail.com</Link>
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    CCC Foundation: <Link href="tel:1333" color="blue.500">1333</Link> (toll-free)
                  </Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={1} color={textColor}>Anti-Ragging Legislation</Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Ragging is a punishable offense under Act No. 20 of 1998. Perpetrators face up to 10 years imprisonment with hard labor.
                  </Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={1} color={textColor}>University Support</Text>
                  <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
                    Contact your university's anti-ragging committee, student counselors, or dean's office to report incidents confidentially.
                  </Text>
                </Box>
                
                <Button 
                  as={Link}
                  href="https://www.mohe.gov.lk" 
                  isExternal
                  colorScheme="teal" 
                  size="md" 
                  width="full" 
                  mt={2}
                  fontWeight="semibold"
                  leftIcon={<ExternalLinkIcon />}
                >
                  Ministry of Higher Education
                </Button>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="gray" 
              mr={3} 
              onClick={closeDeleteModal}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="Deleting"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete comment confirmation modal */}
      <Modal isOpen={isDeleteCommentModalOpen} onClose={closeDeleteCommentModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this comment? This action cannot be undone.</Text>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="gray" 
              mr={3} 
              onClick={closeDeleteCommentModal}
              isDisabled={isDeletingComment}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteComment}
              isLoading={isDeletingComment}
              loadingText="Deleting"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 