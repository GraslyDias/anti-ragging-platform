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

export default function Register() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('Submitting to:', API_ENDPOINTS.register);
      console.log('Submitting data:', { name, email, password: '****' });
      
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
        // Remove credentials and mode since we're not using cookies
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('Registration response:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Invalid response format');
      }

      if (data.status === 'success') {
      toast({
        title: 'Account created.',
          description: data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      // Redirect to login page
      router.push('/auth/login');
      } else {
        toast({
          title: 'Registration failed.',
          description: data.message || 'Unknown error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again later.',
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
            <Heading fontSize={'2xl'} textAlign={'center'} color={textColor}>
              Sign up
            </Heading>
            <Text fontSize={'lg'} color={mutedTextColor} fontWeight="medium">
              to join the fight against ragging ✌️
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
                <FormControl id="name" isInvalid={!!errors.name}>
                  <FormLabel color={textColor} fontWeight="medium">Name</FormLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                  <FormErrorMessage fontWeight="medium">{errors.name}</FormErrorMessage>
                </FormControl>
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
                <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
                  <FormLabel color={textColor} fontWeight="medium">Confirm Password</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <FormErrorMessage fontWeight="medium">{errors.confirmPassword}</FormErrorMessage>
                </FormControl>
                <Stack spacing={10} pt={2}>
                  <Button
                    loadingText="Submitting"
                    size="lg"
                    bg={'blue.500'}
                    color={'white'}
                    _hover={{
                      bg: 'blue.600',
                    }}
                    type="submit"
                    isLoading={isLoading}
                    fontWeight="semibold"
                  >
                    Sign up
                  </Button>
                </Stack>
                <Stack pt={5}>
                  <Text align={'center'} color={textColor}>
                    Already a user?{' '}
                    <Link 
                      as={NextLink} 
                      href="/auth/login" 
                      color={'blue.500'}
                      fontWeight="semibold"
                      _hover={{
                        textDecoration: 'underline',
                      }}
                    >
                      Login
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
              <strong>Note:</strong> This form now connects to the real registration API. Your information will be stored in the database.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}