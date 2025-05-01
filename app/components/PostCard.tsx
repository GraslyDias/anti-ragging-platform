'use client';

import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  Image,
  Button,
  Flex,
  Badge,
  Icon,
  HStack,
  LinkBox,
  LinkOverlay,
  useBreakpointValue,
  Skeleton,
  IconButton,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FaHandsHelping, FaComment, FaChevronLeft, FaChevronRight, FaFistRaised } from 'react-icons/fa';
import NextLink from 'next/link';
import { useState } from 'react';

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    image?: string | null;
    images?: string[];
    created_at: string;
    user: {
      id: number;
      name: string;
      avatar?: string;
    };
    likes?: number;
    comments?: any[];
    comments_count?: number;
    institution?: string;
    category?: 'physical' | 'verbal' | 'psychological' | 'other' | string;
  };
  featured?: boolean;
  onClick?: () => void;
}

export default function PostCard({ post, featured = false, onClick }: PostCardProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Format post image data correctly
  const images = post.images || (post.image ? [post.image] : []);
  const hasImages = images.length > 0;
  
  // Color mode values
  const cardBgColor = useColorModeValue(
    featured ? 'blue.50' : 'white', 
    featured ? 'blue.900' : 'gray.800'
  );
  const borderColor = useColorModeValue(
    featured ? 'blue.200' : 'gray.200', 
    featured ? 'blue.700' : 'gray.700'
  );
  const headingColor = useColorModeValue('gray.800', 'white');
  const contentColor = useColorModeValue('gray.600', 'gray.300');
  const userNameColor = useColorModeValue('gray.800', 'white');
  const dateColor = useColorModeValue('gray.500', 'gray.400');
  const statColor = useColorModeValue('gray.600', 'gray.400');
  const badgeTextColor = useColorModeValue('white', 'white');
  const hoverBorderColor = useColorModeValue('blue.300', 'blue.500');
  const hoverBgColor = useColorModeValue(featured ? 'blue.100' : 'gray.50', featured ? 'blue.800' : 'gray.700');
  const skeletonStartColor = useColorModeValue('gray.100', 'gray.700');
  const skeletonEndColor = useColorModeValue('gray.300', 'gray.600');
  const carouselBgColor = useColorModeValue('blackAlpha.50', 'blackAlpha.400');
  const carouselIconColor = useColorModeValue('gray.800', 'white');

  // Format the created_at date
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  // Category color mapping
  const categoryColors = {
    physical: 'red',
    verbal: 'orange',
    psychological: 'purple',
    other: 'gray'
  };

  // Function to get the category color safely
  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'gray';
    return categoryColors[category as keyof typeof categoryColors] || 'blue';
  };

  // Single image height for better card appearance
  const imageHeight = useBreakpointValue({ base: '200px', md: '280px' });
  
  // Navigate between multiple images
  const showNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };
  
  const showPrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // Render the card content
  const cardContent = (
    <Stack spacing={4}>
      {/* Card header with category badges */}
      <HStack>
        {post.category && (
          <Badge 
            colorScheme={getCategoryColor(post.category)} 
            variant="solid" 
            px={2} 
            py={1} 
            borderRadius="full"
            fontSize="xs"
            color={badgeTextColor}
          >
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </Badge>
        )}
        {post.institution && (
          <Badge variant="outline" colorScheme="blue" fontSize="xs">
            {post.institution}
          </Badge>
        )}
        
        {images.length > 1 && (
          <Badge variant="subtle" colorScheme="green" fontSize="xs">
            {images.length} Images
          </Badge>
        )}
      </HStack>
      
      {/* Post Title */}
      {onClick ? (
        <Heading
          color={headingColor}
          fontSize={{ base: 'xl', md: '2xl' }}
          fontFamily={'body'}
          fontWeight="bold"
          _hover={{ color: 'blue.500' }}
          lineHeight={1.2}
        >
          {post.title}
        </Heading>
      ) : (
        <LinkOverlay as={NextLink} href={`/posts/${post.id}`}>
          <Heading
            color={headingColor}
            fontSize={{ base: 'xl', md: '2xl' }}
            fontFamily={'body'}
            fontWeight="bold"
            _hover={{ color: 'blue.500' }}
            lineHeight={1.2}
          >
            {post.title}
          </Heading>
        </LinkOverlay>
      )}
      
      {/* Images Section - Always shown */}
      {hasImages && (
        <Box 
          position="relative"
          borderRadius="lg"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          height={imageHeight}
        >
          {(() => {
            // Process the image URL to ensure it displays correctly
            let currentImageUrl = images[currentImageIndex];
            
            // Log the image URL for debugging
            console.log('Original image URL:', currentImageUrl);
            
            // Make sure it's a string
            if (typeof currentImageUrl !== 'string' || !currentImageUrl) {
              console.log('Invalid image URL, using placeholder');
              return (
                <Skeleton 
                  height="100%" 
                  width="100%" 
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                />
              );
            }
            
            // Direct access to images - simple path handling
            // If the image is just a filename, add the path to the uploads folder
            if (!currentImageUrl.includes('/')) {
              currentImageUrl = `http://localhost/anti-ragging-platform/api/uploads/posts/${currentImageUrl}`;
              console.log('Using direct URL to PHP server:', currentImageUrl);
            }
            // For relative paths, add the domain
            else if (currentImageUrl.startsWith('/')) {
              currentImageUrl = `http://localhost${currentImageUrl}`;
              console.log('Using direct URL with domain:', currentImageUrl);
            }
            
            console.log('Final image URL:', currentImageUrl);
            
            return (
              <Image
                src={currentImageUrl}
                alt={post.title}
                objectFit="cover"
                width="100%"
                height="100%"
                fallback={
                  <Skeleton 
                    height="100%" 
                    width="100%" 
                    startColor={skeletonStartColor}
                    endColor={skeletonEndColor}
                  />
                }
              />
            );
          })()}
          
          {/* Image counter indicator */}
          {images.length > 1 && (
            <HStack 
              position="absolute" 
              bottom="2" 
              left="0" 
              right="0" 
              justifyContent="center"
              spacing={1}
            >
              {images.map((_, index) => (
                <Box 
                  key={index}
                  h="2"
                  w="2"
                  borderRadius="full"
                  bg={index === currentImageIndex ? "blue.500" : "whiteAlpha.700"}
                />
              ))}
            </HStack>
          )}
          
          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <IconButton
                aria-label="Previous image"
                icon={<FaChevronLeft />}
                size="sm"
                borderRadius="full"
                position="absolute"
                left="2"
                top="50%"
                transform="translateY(-50%)"
                onClick={showPrevImage}
                bg={carouselBgColor}
                color={carouselIconColor}
                _hover={{ bg: 'blackAlpha.300' }}
              />
              <IconButton
                aria-label="Next image"
                icon={<FaChevronRight />}
                size="sm"
                borderRadius="full"
                position="absolute"
                right="2"
                top="50%"
                transform="translateY(-50%)"
                onClick={showNextImage}
                bg={carouselBgColor}
                color={carouselIconColor}
                _hover={{ bg: 'blackAlpha.300' }}
              />
            </>
          )}
        </Box>
      )}
      
      {/* Post Content */}
      <Text color={contentColor} noOfLines={3} fontSize="md">
        {post.content}
      </Text>
      
      {/* Footer with user info and actions */}
      <Flex justify="space-between" align="center" mt={2}>
        <Stack direction={'row'} spacing={2} align={'center'}>
          <Avatar
            bg={'blue.500'}
            name={post.user.name}
            src={post.user.avatar || `https://via.placeholder.com/40?text=${encodeURIComponent(post.user.name.charAt(0))}`}
            size="sm"
          />
          <Stack direction={'column'} spacing={0} fontSize={'sm'}>
            <Text fontWeight={600} color={userNameColor}>{post.user.name}</Text>
            <Text color={dateColor}>{formattedDate}</Text>
          </Stack>
        </Stack>
      
        <HStack spacing={4}>
          {post.likes !== undefined && (
            <HStack spacing={1}>
              <Icon as={FaFistRaised} color="blue.600" />
              <Text fontSize="sm" color={statColor}>{post.likes}</Text>
            </HStack>
          )}
          
          {post.comments && (
            <HStack spacing={1}>
              <Icon as={FaComment} color="blue.400" />
              <Text fontSize="sm" color={statColor}>{post.comments.length}</Text>
            </HStack>
          )}
          
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/posts/${post.id}`);
            }}
            size="sm"
            colorScheme="blue"
            variant="outline"
            borderRadius="full"
            _hover={{
              bg: 'blue.50',
              color: 'blue.600',
            }}
          >
            Read more
          </Button>
        </HStack>
      </Flex>
    </Stack>
  );

  // Common style props for both Box and LinkBox
  const containerProps = {
    maxW: '100%',
    w: 'full',
    bg: cardBgColor,
    boxShadow: 'md',
    rounded: 'lg',
    p: 6,
    overflow: 'hidden',
    mb: 4,
    borderWidth: '1px',
    borderColor: borderColor,
    transition: 'all 0.3s',
    _hover: {
      transform: 'translateY(-5px)',
      boxShadow: 'xl',
      borderColor: hoverBorderColor,
      bg: hoverBgColor,
    }
  };

  // Render either a clickable Box or a LinkBox based on the presence of onClick
  return onClick ? (
    <Box 
      {...containerProps}
      onClick={(e) => {
        // Prevent click if the user clicked on an image navigation button
        if ((e.target as HTMLElement).closest('button')) return;
        onClick();
      }}
      cursor="pointer"
    >
      {cardContent}
    </Box>
  ) : (
    <LinkBox as={Box} {...containerProps}>
      {cardContent}
    </LinkBox>
  );
} 