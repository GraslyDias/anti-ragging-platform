'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedPosts from './components/FeaturedPosts';

export default function Home() {
  const bgColor = useColorModeValue('white', 'gray.900');
  
  return (
    <Box bg={bgColor}>
      <Navbar />
      <Box id="main-content">
        <Hero />
        <FeaturedPosts />
      </Box>
    </Box>
  );
}
