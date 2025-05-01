'use client';

import { Box, Flex, Text, Image, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';

interface LogoProps {
  withText?: boolean;
  size?: string;
  fontSize?: string;
}

export default function Logo({ withText = true, size = "40px", fontSize = "xl" }: LogoProps) {
  const logoBg = useColorModeValue('blue.500', 'blue.400');
  const textColor = useColorModeValue('gray.800', 'white');
  const gradientStart = useColorModeValue('blue.400', 'blue.300');
  const gradientEnd = useColorModeValue('teal.400', 'teal.200');
  
  return (
    <Flex align="center">
      <Box 
        position="relative"
        width={size}
        height={size}
        borderRadius="md"
        overflow="hidden"
        bg={logoBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="0 2px 5px rgba(0,0,0,0.2)"
      >
        {/* SVG shield logo with AR text */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ padding: '5%' }}
        >
          <path 
            d="M20 2C14 2 4 6 4 6V22C4 28 9 34 20 38C31 34 36 28 36 22V6C36 6 26 2 20 2Z" 
            fill="white" 
          />
          <path 
            d="M14 24L16 16L18 20L20 16L22 20L24 16L26 24" 
            stroke="#3182CE" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Converting text to path for better browser compatibility */}
          <path
            d="M14.2 15.6H17.1L17.1 14.4H14.9V13.5H17.1V12.4H14.2V11.3H18.2V16.7H14.2V15.6Z"
            fill="#3182CE"
          />
          <path
            d="M22.3 16.7L20.6 14.5L20.6 16.7H19.5V11.3H20.6V13.4L22.2 11.3H23.6L21.8 13.6L23.7 16.7H22.3Z"
            fill="#3182CE"
          />
        </svg>
      </Box>

      {withText && (
        <NextLink href="/" passHref>
          <Text
            ml={2}
            fontWeight="bold"
            fontSize={fontSize}
            bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
            bgClip="text"
            letterSpacing="tight"
            cursor="pointer"
          >
            Anti-Ragging Platform
          </Text>
        </NextLink>
      )}
    </Flex>
  );
} 