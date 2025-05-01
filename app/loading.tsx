'use client';

import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react';

export default function Loading() {
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  return (
    <Flex 
      height="100vh" 
      width="100%" 
      justifyContent="center" 
      alignItems="center" 
      direction="column"
      bg={bgColor}
    >
      <Spinner 
        size="xl" 
        thickness="4px"
        speed="0.65s"
        color="blue.500"
        mb={4}
      />
      <Text fontSize="lg" fontWeight="medium" color={textColor}>
        Loading...
      </Text>
    </Flex>
  );
} 