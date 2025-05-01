'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  FormErrorMessage,
  Text,
  Progress,
  Select,
  Flex,
  Alert,
  AlertIcon,
  useColorModeValue,
  Grid,
  IconButton,
  Image,
  Spinner,
} from '@chakra-ui/react';
import { useRouter, useParams } from 'next/navigation';
import { CloseIcon } from '@chakra-ui/icons';
import Navbar from '../../../components/Navbar';
import API_ENDPOINTS, { API_BASE } from '@/app/config/api';

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const toast = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ 
    title?: string; 
    content?: string;
    category?: string;
    institution?: string;
  }>({});
  const [userInfo, setUserInfo] = useState<{id: number, name: string} | null>(null);

  // Color mode values
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const boxBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.900', 'white');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const progressBgColor = useColorModeValue('gray.100', 'gray.600');
  const optionBgColor = useColorModeValue('white', 'gray.700');
  const optionTextColor = useColorModeValue('gray.900', 'gray.100');
  const optionHoverBgColor = useColorModeValue('blue.50', 'blue.900');

  // List of institutions for the dropdown
  const institutions = [
    'University of Colombo',
    'University of Moratuwa',
    'University of Peradeniya',
    'University of Kelaniya',
    'University of Sri Jayewardenepura',
    'University of Jaffna',
    'University of Ruhuna',
    'University of Sabaragamuwa',
    'University of Vavuniya',
    'University of Wayamba',
    'Eastern University',
  ];

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to edit a post',
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
      setUserInfo({
        id: userData.id,
        name: userData.name || 'User',
      });

      // Fetch the post data
      const fetchPost = async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
          const response = await fetch(API_ENDPOINTS.getPost(postId));
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.status === 'success') {
            const post = data.post;
            
            // Check if current user is the owner of this post
            if (post.user.id !== userData.id) {
              toast({
                title: 'Access denied',
                description: 'You can only edit your own posts',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top',
              });
              router.push('/dashboard');
              return;
            }
            
            // Set post data to form
            setTitle(post.title);
            setContent(post.content);
            setCategory(post.category);
            setInstitution(post.institution);
            
            // Set images if they exist
            if (post.images && post.images.length > 0) {
              setImages(post.images);
              // Create preview URLs for existing images
              const imageUrls = post.images.map((img: string) => {
                // Format image URLs properly
                if (!img.includes('/')) {
                  return `${API_BASE}/api/uploads/posts/${img}`;
                }
                return img;
              });
              setImagePreviewUrls(imageUrls);
            }
          } else {
            throw new Error(data.message || 'Failed to load post');
          }
        } catch (error: any) {
          console.error('Error fetching post:', error);
          setLoadError(error.message || 'Failed to load post data');
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
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }, [postId, router, toast]);

  const validateForm = () => {
    const newErrors: { 
      title?: string; 
      content?: string;
      category?: string;
      institution?: string;
    } = {};
    
    if (!title) {
      newErrors.title = 'Title is required';
    }
    
    if (!content) {
      newErrors.content = 'Content is required';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!institution) {
      newErrors.institution = 'Please select an institution';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Create preview URLs for new files
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      // Update state
      setNewImages(prevImages => [...prevImages, ...newFiles]);
      setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // Check if it's a new image or an existing one
    if (index < images.length) {
      // It's an existing image
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
      setImagePreviewUrls(prevUrls => {
        const filteredUrls = [...prevUrls];
        filteredUrls.splice(index, 1);
        return filteredUrls;
      });
    } else {
      // It's a new image
      const newImageIndex = index - images.length;
      setNewImages(prevImages => prevImages.filter((_, i) => i !== newImageIndex));
      setImagePreviewUrls(prevUrls => {
        const filteredUrls = [...prevUrls];
        filteredUrls.splice(index, 1);
        return filteredUrls;
      });
    }
  };

  // Actual image upload function
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.file_path;
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle all image uploads
  const handleImageUpload = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const totalImages = newImages.length;
    let uploadedCount = 0;
    
    // Add existing images first
    if (images.length > 0) {
      uploadedUrls.push(...images);
    }
    
    // Process new uploads one by one
    if (newImages.length > 0) {
      for (const file of newImages) {
        try {
          // Upload the image
          const imageUrl = await uploadImage(file);
          uploadedUrls.push(imageUrl);
          
          // Update progress
          uploadedCount++;
          setUploadProgress(Math.floor((uploadedCount / totalImages) * 100));
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue with other uploads even if one fails
        }
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userInfo) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Handle image upload first
      let imageUrls: string[] = [];
      if (images.length > 0 || newImages.length > 0) {
        imageUrls = await handleImageUpload();
      }
      
      console.log('Submitting to:', API_ENDPOINTS.updatePost);
      console.log('With images:', imageUrls);
      
      // Make API request to update post
      const response = await fetch(API_ENDPOINTS.updatePost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userInfo.id,
          title,
          content,
          category,
          institution,
          images: imageUrls.length > 0 ? imageUrls : null
        }),
      });
      
      const data = await response.json();
      console.log('Update post response:', data);
      
      if (response.ok && data.status === 'success') {
        toast({
          title: 'Post updated',
          description: data.message || 'Your story has been successfully updated',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        
        // Redirect to the post page
        router.push(`/posts/${postId}`);
      } else {
        throw new Error(data.message || 'Failed to update post');
      }
    } catch (error: any) {
      console.error('Update post error:', error);
      toast({
        title: 'Failed to update post',
        description: error.message || 'An error occurred while updating your post',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Box bg={pageBgColor} minH="100vh">
        <Navbar />
        <Container maxW="4xl" py={8}>
          <Flex direction="column" align="center" justify="center" py={20}>
            <Spinner size="xl" color="blue.500" mb={6} />
            <Text color={textColor} fontSize="lg">Loading post data...</Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box bg={pageBgColor} minH="100vh">
        <Navbar />
        <Container maxW="4xl" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text color={textColor}>{loadError}</Text>
          </Alert>
          <Button mt={4} colorScheme="blue" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={pageBgColor} minH="100vh">
      <Navbar />
      <Container maxW="4xl" py={8}>
        <Box
          bg={boxBgColor}
          p={8}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading as="h1" mb={6} color={headingColor}>
            Edit Your Story
          </Heading>
          <Text mb={8} color={mutedTextColor} fontWeight="medium">
            Update your post with the latest information or corrections.
          </Text>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel color={labelColor} fontWeight="medium">Title</FormLabel>
                <Input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your story"
                  bg={inputBgColor}
                  color={inputTextColor}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  _hover={{
                    borderColor: "blue.300",
                  }}
                />
                <FormErrorMessage color={errorColor} fontWeight="medium">{errors.title}</FormErrorMessage>
              </FormControl>
              
              <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isInvalid={!!errors.category}>
                  <FormLabel color={labelColor} fontWeight="medium">Category</FormLabel>
                  <Select 
                    placeholder="Select category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    bg={inputBgColor}
                    color={inputTextColor}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    _hover={{
                      borderColor: "blue.300",
                    }}
                    sx={{
                      '& option': {
                        bg: optionBgColor,
                        color: optionTextColor,
                      },
                      '& option:hover': {
                        bg: optionHoverBgColor,
                      }
                    }}
                  >
                    <option value="physical">Physical Ragging</option>
                    <option value="verbal">Verbal Ragging</option>
                    <option value="psychological">Psychological Ragging</option>
                    <option value="other">Other</option>
                  </Select>
                  <FormErrorMessage color={errorColor} fontWeight="medium">{errors.category}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.institution}>
                  <FormLabel color={labelColor} fontWeight="medium">Institution</FormLabel>
                  <Select 
                    placeholder="Select institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    bg={inputBgColor}
                    color={inputTextColor}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    _hover={{
                      borderColor: "blue.300",
                    }}
                    sx={{
                      '& option': {
                        bg: optionBgColor,
                        color: optionTextColor,
                      },
                      '& option:hover': {
                        bg: optionHoverBgColor,
                      }
                    }}
                  >
                    {institutions.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </Select>
                  <FormErrorMessage color={errorColor} fontWeight="medium">{errors.institution}</FormErrorMessage>
                </FormControl>
              </Flex>
              
              <FormControl isInvalid={!!errors.content}>
                <FormLabel color={labelColor} fontWeight="medium">Your Story</FormLabel>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience in detail"
                  size="lg"
                  minH="200px"
                  bg={inputBgColor}
                  color={inputTextColor}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  _hover={{
                    borderColor: "blue.300",
                  }}
                />
                <FormErrorMessage color={errorColor} fontWeight="medium">{errors.content}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel color={labelColor} fontWeight="medium">Upload Additional Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  p={2}
                  multiple
                  bg={inputBgColor}
                  color={inputTextColor}
                  borderColor={borderColor}
                />
                <Text fontSize="sm" color={mutedTextColor} mt={1}>
                  Upload one or more new images to add to your story (optional)
                </Text>
              </FormControl>
              
              {/* Image previews */}
              {imagePreviewUrls.length > 0 && (
                <Box 
                  borderWidth="1px" 
                  borderRadius="md" 
                  p={4} 
                  borderColor={borderColor}
                  mb={2}
                >
                  <Text mb={3} fontWeight="medium" color={headingColor}>
                    Images ({imagePreviewUrls.length})
                  </Text>
                  <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
                    {imagePreviewUrls.map((url, index) => (
                      <Box 
                        key={`image-${index}`} 
                        position="relative" 
                        borderRadius="md" 
                        overflow="hidden" 
                        borderWidth="1px" 
                        borderColor={borderColor}
                      >
                        <Image 
                          src={url} 
                          alt={`Image ${index + 1}`} 
                          height="100px"
                          width="100%"
                          objectFit="cover"
                        />
                        <IconButton
                          aria-label="Remove image"
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={1}
                          right={1}
                          onClick={() => removeImage(index)}
                        />
                      </Box>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box>
                  <Text mb={1} color={mutedTextColor}>
                    Uploading images: {uploadProgress}%
                  </Text>
                  <Progress 
                    value={uploadProgress} 
                    size="sm" 
                    colorScheme="blue" 
                    borderRadius="full"
                    bg={progressBgColor}
                  />
                </Box>
              )}
              
              <Flex justifyContent="space-between" mt={4}>
                <Button
                  variant="outline"
                  colorScheme="gray"
                  onClick={handleCancel}
                  size="lg"
                  fontWeight="semibold"
                >
                  Cancel
                </Button>
                
                <Button
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                  size="lg"
                  fontWeight="semibold"
                  loadingText={uploadProgress > 0 ? `Uploading images (${uploadProgress}%)...` : "Updating..."}
                >
                  Update Story
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
} 