'use client';

import { Box, Button, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const gradientStart = useColorModeValue('blue.400', 'blue.300');
  const gradientEnd = useColorModeValue('teal.400', 'teal.200');
  
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      p={4}
    >
      <VStack spacing={8} textAlign="center" maxW="lg">
        <NextLink href="/" passHref>
          <Text
            fontWeight="bold"
            fontSize="2xl" 
            bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
            bgClip="text"
            letterSpacing="tight"
            cursor="pointer"
          >
            Anti-Ragging Platform
          </Text>
        </NextLink>
        
        <Heading as="h1" size="2xl" color={headingColor}>
          404 - Page Not Found
        </Heading>
        
        <Text fontSize="xl" color={textColor}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Button 
          colorScheme="blue" 
          size="lg"
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </VStack>
    </Box>
  );
} 