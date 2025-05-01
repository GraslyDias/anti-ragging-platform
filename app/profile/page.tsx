'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Flex,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Skeleton,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Navbar from '../components/Navbar';
import API_ENDPOINTS, { API_BASE } from '@/app/config/api';
import { format } from 'date-fns';

export default function Profile() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    joinDate: '',
  });

  // Change password modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Color mode values
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.900', 'white');
  const skeletonStartColor = useColorModeValue('gray.100', 'gray.700');
  const skeletonEndColor = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to view your profile',
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
      
      // Load user data from localStorage
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
      });
      
      // Format join date if available
      if (userData.created_at) {
        try {
          const joinDate = format(new Date(userData.created_at), 'MMMM yyyy');
          setUserStats(prev => ({ ...prev, joinDate }));
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      } else {
        // No created_at date available, fetch it from the database
        fetchUserCreatedDate(userData.id);
      }
      
      // Load user statistics
      fetchUserStats(userData.id);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }, [router, toast]);
  
  // Function to fetch user's account creation date if not in localStorage
  const fetchUserCreatedDate = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/get_user_info.php?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.user && data.user.created_at) {
          const joinDate = format(new Date(data.user.created_at), 'MMMM yyyy');
          setUserStats(prev => ({ ...prev, joinDate }));
          
          // Update local user data
          if (user) {
            const updatedUser = { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
              avatar: user.avatar,
              created_at: data.user.created_at 
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user creation date:', error);
    }
  };
  
  // Function to fetch user statistics
  const fetchUserStats = async (userId: number) => {
    setIsLoadingStats(true);
    try {
      // Fetch posts count
      const postsResponse = await fetch(`${API_ENDPOINTS.getUserPosts(userId)}&count_only=1`);
      let postsCount = 0;
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        if (postsData.status === 'success') {
          postsCount = postsData.count || 0;
        }
      }
      
      // Fetch comments count
      let commentsCount = 0;
      try {
        const commentsResponse = await fetch(`${API_BASE}/api/comments/get_user_comments_count.php?user_id=${userId}`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          if (commentsData.status === 'success') {
            commentsCount = commentsData.count || 0;
          }
        }
      } catch (commentError) {
        console.error('Error fetching comments count:', commentError);
      }
      
      setUserStats(prev => ({
        ...prev,
        postsCount,
        commentsCount
      }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // Clear error when typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: undefined,
      });
    }
  };

  const validatePasswordForm = () => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !user) {
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      console.log('Submitting to:', API_ENDPOINTS.changePassword);
      
      const response = await fetch(API_ENDPOINTS.changePassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast({
          title: 'Password changed',
          description: data.message || 'Your password has been successfully updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to change password',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Submitting to:', API_ENDPOINTS.updateProfile);
      
      const response = await fetch(API_ENDPOINTS.updateProfile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name: formData.name,
          email: formData.email,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        // Update user data
        const updatedUser = {
          ...user,
          ...data.user,
        };
        
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast({
          title: 'Profile updated',
          description: data.message || 'Your profile has been successfully updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        
        setIsEditing(false);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg={pageBgColor} minH="100vh">
      <Navbar />
      <Container maxW="4xl" py={{ base: 6, md: 12 }} px={{ base: 4, md: 6 }}>
        <Heading as="h1" mb={{ base: 4, md: 6 }} color={headingColor} fontSize={{ base: "2xl", md: "3xl" }}>
          Your Profile
        </Heading>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 6, md: 8 }}
          align="stretch"
          width="full"
        >
          {/* Profile Info Card */}
          <Card 
            variant="outline" 
            flex={{ base: 1, md: "0 0 auto" }}
            boxShadow="sm" 
            bg={cardBgColor} 
            borderColor={borderColor}
            width={{ base: "full", md: "250px" }}
          >
            <CardBody>
              {isLoading ? (
                <Stack spacing={4}>
                  <Flex justify="center">
                    <Skeleton 
                      height="120px" 
                      width="120px" 
                      borderRadius="full" 
                      startColor={skeletonStartColor}
                      endColor={skeletonEndColor}
                    />
                  </Flex>
                  <Skeleton 
                    height="20px" 
                    width="50%" 
                    mx="auto" 
                    startColor={skeletonStartColor}
                    endColor={skeletonEndColor}
                  />
                  <Skeleton 
                    height="15px" 
                    width="70%" 
                    mx="auto" 
                    startColor={skeletonStartColor}
                    endColor={skeletonEndColor}
                  />
                  <Skeleton 
                    height="15px" 
                    width="60%" 
                    mx="auto" 
                    startColor={skeletonStartColor}
                    endColor={skeletonEndColor}
                  />
                </Stack>
              ) : (
                <Stack align="center" spacing={4}>
                  <Avatar 
                    size={{ base: "xl", md: "2xl" }}
                    name={user?.name} 
                    src={user?.avatar || `https://via.placeholder.com/150?text=${user?.name?.charAt(0)}`}
                    bg="blue.500"
                    color="white"
                  />
                  <Heading size="md" color={headingColor} textAlign="center">{user?.name}</Heading>
                  <Text color={mutedTextColor} textAlign="center" fontSize={{ base: "sm", md: "md" }}>{user?.email}</Text>
                  <Badge colorScheme="green">Active Member</Badge>
                  
                  {!isEditing && (
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      mt={2}
                      width={{ base: "full", md: "auto" }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Stack>
              )}
            </CardBody>
          </Card>

          {/* Edit Profile Form or Account Info */}
          <VStack flex="1" spacing={{ base: 6, md: 8 }} width="full">
            {/* Edit Profile Form */}
            {isEditing && (
              <Card 
                variant="outline" 
                boxShadow="sm"
                bg={cardBgColor} 
                borderColor={borderColor}
                width="full"
              >
                <CardBody>
                  <Heading size="md" mb={4} color={headingColor}>Edit Profile</Heading>
                  <Divider mb={4} borderColor={dividerColor} />
                  
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel color={labelColor} fontWeight="medium">Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
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
                          size={{ base: "md", md: "md" }}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={labelColor} fontWeight="medium">Email</FormLabel>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email"
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
                          size={{ base: "md", md: "md" }}
                        />
                      </FormControl>
                      
                      <Flex 
                        justify={{ base: "center", md: "flex-end" }} 
                        gap={4}
                        direction={{ base: "column", sm: "row" }}
                        mt={2}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          borderColor={borderColor}
                          color={textColor}
                          _hover={{
                            bg: useColorModeValue('gray.100', 'gray.700'),
                          }}
                          width={{ base: "full", sm: "auto" }}
                          order={{ base: 2, sm: 1 }}
                          isDisabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          colorScheme="blue"
                          type="submit"
                          width={{ base: "full", sm: "auto" }}
                          order={{ base: 1, sm: 2 }}
                          isLoading={isSaving}
                          loadingText="Saving..."
                        >
                          Save Changes
                        </Button>
                      </Flex>
                    </Stack>
                  </form>
                </CardBody>
              </Card>
            )}
            
            {/* Account Info */}
            {!isEditing && !isLoading && (
              <Card 
                variant="outline" 
                boxShadow="sm"
                bg={cardBgColor} 
                borderColor={borderColor}
                width="full"
              >
                <CardBody>
                  <Heading size="md" mb={4} color={headingColor}>Account Information</Heading>
                  <Divider mb={4} borderColor={dividerColor} />
                  
                  <Stack spacing={4}>
                    <Flex 
                      justify="space-between" 
                      direction={{ base: "column", sm: "row" }}
                      align={{ base: "flex-start", sm: "center" }}
                    >
                      <Text fontWeight="bold" color={textColor} mb={{ base: 1, sm: 0 }}>Member Since:</Text>
                      {isLoadingStats ? (
                        <Skeleton height="20px" width="100px" />
                      ) : (
                        <Text color={mutedTextColor}>
                          {userStats.joinDate || 'Information not available'}
                        </Text>
                      )}
                    </Flex>
                    
                    <Flex 
                      justify="space-between" 
                      direction={{ base: "column", sm: "row" }}
                      align={{ base: "flex-start", sm: "center" }}
                    >
                      <Text fontWeight="bold" color={textColor} mb={{ base: 1, sm: 0 }}>Reports Shared:</Text>
                      {isLoadingStats ? (
                        <Skeleton height="20px" width="40px" />
                      ) : (
                        <Text color={mutedTextColor}>{userStats.postsCount}</Text>
                      )}
                    </Flex>
                    
                    <Flex 
                      justify="space-between" 
                      direction={{ base: "column", sm: "row" }}
                      align={{ base: "flex-start", sm: "center" }}
                    >
                      <Text fontWeight="bold" color={textColor} mb={{ base: 1, sm: 0 }}>Comments Made:</Text>
                      {isLoadingStats ? (
                        <Skeleton height="20px" width="40px" />
                      ) : (
                        <Text color={mutedTextColor}>{userStats.commentsCount}</Text>
                      )}
                    </Flex>
                    
                    <Divider borderColor={dividerColor} />
                    
                    <Stack spacing={3} mt={2}>
                      <Heading size="sm" color={headingColor}>Account Settings</Heading>
                      
                      <Button 
                        variant="outline" 
                        colorScheme="blue" 
                        size="sm" 
                        justifyContent={{ base: "center", sm: "flex-start" }}
                        width={{ base: "full", sm: "auto" }}
                        onClick={onOpen}
                      >
                        Change Password
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        colorScheme="blue" 
                        size="sm" 
                        justifyContent={{ base: "center", sm: "flex-start" }}
                        width={{ base: "full", sm: "auto" }}
                      >
                        Privacy Settings
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        colorScheme="red" 
                        size="sm" 
                        justifyContent={{ base: "center", sm: "flex-start" }}
                        mt={2}
                        width={{ base: "full", sm: "auto" }}
                      >
                        Delete Account
                      </Button>
                    </Stack>
                    
                    {/* Note about real API */}
                    <Box mt={4} p={3} borderWidth="1px" borderStyle="dashed" borderRadius="md" borderColor={borderColor}>
                      <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                        <strong>Note:</strong> Profile updates and password changes are now saved to the database.
                      </Text>
                    </Box>
                  </Stack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Stack>
      </Container>
      
      {/* Change Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent bg={cardBgColor} mx={4}>
          <ModalHeader color={headingColor}>Change Password</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePasswordSubmit}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!passwordErrors.currentPassword}>
                  <FormLabel color={labelColor}>Current Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      bg={inputBgColor}
                      color={inputTextColor}
                      borderColor={borderColor}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{passwordErrors.currentPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!passwordErrors.newPassword}>
                  <FormLabel color={labelColor}>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      bg={inputBgColor}
                      color={inputTextColor}
                      borderColor={borderColor}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{passwordErrors.newPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!passwordErrors.confirmPassword}>
                  <FormLabel color={labelColor}>Confirm New Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      bg={inputBgColor}
                      color={inputTextColor}
                      borderColor={borderColor}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{passwordErrors.confirmPassword}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={isChangingPassword}
                loadingText="Updating..."
              >
                Update Password
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
} 