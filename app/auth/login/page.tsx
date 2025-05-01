'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  useToast,
  FormErrorMessage,
  useColorModeValue,
  Container,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import API_ENDPOINTS from '@/app/config/api';

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Color mode values
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const boxBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const demoBgColor = useColorModeValue('gray.50', 'gray.700');
  const demoBorderColor = useColorModeValue('gray.300', 'gray.600');
  const demoTextColor = useColorModeValue('gray.700', 'gray.300');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      console.log('Submitting to:', API_ENDPOINTS.login);
      
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      console.log('Response status:', response.status);
      
      // Get the response data regardless of status code
      let data;
      try {
        data = await response.json();
        console.log('Login response:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
      
      // Handle different response statuses
      if (response.status === 401) {
        // Authentication error (wrong credentials)
        toast({
          title: 'Login failed',
          description: 'Incorrect email or password. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      
      // Handle other error status codes
      if (!response.ok) {
        throw new Error(data.message || `Server error (${response.status})`);
      }
      
      if (data.status === 'success') {
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: 'Login successful.',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login failed.',
          description: data.message || 'An error occurred during login.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Something went wrong. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH={'100vh'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={pageBgColor}
    >
      <Container maxW="lg" py={12}>
        <Stack spacing={8} mx={'auto'}>
          <Stack align={'center'} spacing={3}>
            <NextLink href="/" passHref>
              <Heading 
                fontSize={'4xl'} 
                color={headingColor} 
                cursor="pointer"
                fontWeight="bold"
              >
                Anti-Ragging Platform
              </Heading>
            </NextLink>
            <Heading fontSize={'2xl'} color={textColor}>Sign in to your account</Heading>
            <Text fontSize={'lg'} color={mutedTextColor} fontWeight="medium">
              to share your story and help others ✌️
            </Text>
          </Stack>
          <Box
            rounded={'lg'}
            bg={boxBgColor}
            boxShadow={'lg'}
            p={{ base: 6, md: 8 }}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={5}>
                <FormControl id="email" isInvalid={!!errors.email}>
                  <FormLabel color={textColor} fontWeight="medium">Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBgColor}
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    _hover={{
                      borderColor: "blue.300",
                    }}
                    size="lg"
                  />
                  <FormErrorMessage fontWeight="medium">{errors.email}</FormErrorMessage>
                </FormControl>
                <FormControl id="password" isInvalid={!!errors.password}>
                  <FormLabel color={textColor} fontWeight="medium">Password</FormLabel>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBgColor}
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    _hover={{
                      borderColor: "blue.300",
                    }}
                    size="lg"
                  />
                  <FormErrorMessage fontWeight="medium">{errors.password}</FormErrorMessage>
                </FormControl>
                <Stack spacing={10}>
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    align={'start'}
                    justify={'space-between'}
                  >
                    <Link 
                      color={'blue.500'}
                      fontWeight="semibold"
                      _hover={{
                        textDecoration: 'underline',
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Stack>
                  <Button
                    bg={'blue.500'}
                    color={'white'}
                    _hover={{
                      bg: 'blue.600',
                    }}
                    type="submit"
                    isLoading={isLoading}
                    size="lg"
                    fontWeight="semibold"
                  >
                    Sign in
                  </Button>
                </Stack>
                <Stack pt={5}>
                  <Text align={'center'} color={textColor}>
                    Don't have an account?{' '}
                    <Link 
                      as={NextLink} 
                      href="/auth/register" 
                      color={'blue.500'}
                      fontWeight="semibold"
                      _hover={{
                        textDecoration: 'underline',
                      }}
                    >
                      Register
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Box>
          
          {/* Demo instructions */}
          <Box
            p={4}
            border="1px dashed"
            borderColor={demoBorderColor}
            borderRadius="md"
            bg={demoBgColor}
          >
            <Text align="center" fontSize="sm" color={demoTextColor} fontWeight="medium">
              <strong>Note:</strong> This form now connects to the real login API. Please use credentials from a registered account.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
} 