'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Image,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useBreakpointValue,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from '@chakra-ui/icons';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import API_ENDPOINTS from '../config/api';

// Define Post interface based on API response
interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  images?: string[];
  created_at: string;
  updated_at?: string;
  category?: string;
  institution?: string;
  likes?: number;
  comments_count?: number;
  user: User;
}

export default function Posts() {
  const router = useRouter();
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [institutionFilter, setInstitutionFilter] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<{type: string, value: string}[]>([]);

  // Color mode values
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600');
  const filterTagBgLight = useColorModeValue('blue.50', 'blue.900');
  const filterTagColorLight = useColorModeValue('blue.800', 'blue.100');
  const noResultsBoxBg = useColorModeValue('white', 'gray.800');
  const noResultsBorderColor = useColorModeValue('gray.200', 'gray.700');
  const bannerBgLight = useColorModeValue('blue.600', 'blue.800');
  const bannerBgDark = useColorModeValue('purple.600', 'purple.900');

  const bannerSize = useBreakpointValue({ base: '150px', md: '250px' });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }

    // Fetch posts from API
    const fetchPosts = async () => {
      setIsLoading(true);
      setIsError(false);
      
      try {
        const response = await fetch(API_ENDPOINTS.getAllPosts);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          console.log('Fetched posts:', data.posts);
          setPosts(data.posts || []);
          setFilteredPosts(data.posts || []);
        } else {
          throw new Error(data.message || 'Failed to fetch posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsError(true);
        toast({
          title: 'Error loading posts',
          description: 'Could not load the posts. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [toast]);

  useEffect(() => {
    // Apply filters whenever posts or filter criteria change
    let result = [...posts];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(post => post.category === categoryFilter);
    }
    
    // Apply institution filter
    if (institutionFilter) {
      result = result.filter(post => post.institution === institutionFilter);
    }
    
    setFilteredPosts(result);
  }, [posts, searchTerm, categoryFilter, institutionFilter]);

  // Get unique categories and institutions for filters
  const categories = [...new Set(posts.filter(post => post.category).map(post => post.category))];
  const institutions = [...new Set(posts.filter(post => post.institution).map(post => post.institution))];

  const handleCreatePost = () => {
    if (isLoggedIn) {
      router.push('/posts/create');
    } else {
      router.push('/auth/login');
    }
  };

  const handleViewPost = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  const addFilter = (type: string, value: string) => {
    if (value && !activeFilters.some(f => f.type === type && f.value === value)) {
      setActiveFilters([...activeFilters, {type, value}]);
      
      if (type === 'category') setCategoryFilter(value);
      if (type === 'institution') setInstitutionFilter(value);
    }
  };

  const removeFilter = (type: string, value: string) => {
    setActiveFilters(activeFilters.filter(f => !(f.type === type && f.value === value)));
    
    if (type === 'category') setCategoryFilter('');
    if (type === 'institution') setInstitutionFilter('');
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setCategoryFilter('');
    setInstitutionFilter('');
    setSearchTerm('');
  };

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
      
      {/* Banner Section */}
      <Box 
        color="white" 
        position="relative" 
        overflow="hidden"
        height={bannerSize}
      >
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          bgGradient={`linear(to-r, ${bannerBgLight}, ${bannerBgDark})`} 
          opacity={0.9}
        />
        
        <Image 
          src="/images/banner-overlay.jpg" 
          alt="Campus" 
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={0.3}
          fallbackSrc="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop"
          style={{ objectPosition: 'center' }}
        />
        
        <Container maxW={'7xl'} position="relative" height="100%" py={8}>
          <Flex 
            direction="column" 
            justify="center" 
            align="center" 
            textAlign="center"
            height="100%"
          >
            <Heading as="h1" size="2xl" mb={2} color="white" fontWeight="bold">
              Ragging Reports
            </Heading>
            <Text fontSize="lg" maxW="xl" color="white" fontWeight="medium">
              Read stories shared by victims of ragging in Sri Lankan campuses
            </Text>
          </Flex>
        </Container>
      </Box>
      
      <Container maxW={'7xl'} py={12}>
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align="center" 
          mb={8} 
          gap={4}
        >
          <Button 
            colorScheme="blue" 
            size="md" 
            onClick={handleCreatePost}
            leftIcon={<span>➕</span>}
            fontWeight="semibold"
          >
            Share Your Story
          </Button>
          
          <HStack spacing={4} width={{ base: '100%', md: 'auto' }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={mutedTextColor} />
              </InputLeftElement>
              <Input 
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                width={{ base: '100%', md: '250px' }}
                bg={inputBgColor}
                color={textColor}
                borderColor={inputBorderColor}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px blue.400",
                }}
                _hover={{
                  borderColor: "blue.300",
                }}
              />
            </InputGroup>
            
            <Select 
              placeholder="Filter by category" 
              value={categoryFilter}
              onChange={(e) => addFilter('category', e.target.value)}
              width={{ base: '100%', md: '200px' }}
              bg={inputBgColor}
              color={textColor}
              borderColor={inputBorderColor}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px blue.400",
              }}
              _hover={{
                borderColor: "blue.300",
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            
            <Select 
              placeholder="Filter by institution"
              value={institutionFilter}
              onChange={(e) => addFilter('institution', e.target.value)}
              width={{ base: '100%', md: '200px' }}
              bg={inputBgColor}
              color={textColor}
              borderColor={inputBorderColor}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px blue.400",
              }}
              _hover={{
                borderColor: "blue.300",
              }}
            >
              {institutions.map((institution) => (
                <option key={institution} value={institution}>
                  {institution}
                </option>
              ))}
            </Select>
          </HStack>
        </Flex>
        
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <Flex mb={6} wrap="wrap" gap={2} align="center">
            <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>
              Active filters:
            </Text>
            {activeFilters.map((filter, index) => (
              <Tag 
                key={index} 
                size="md" 
                borderRadius="full" 
                variant="solid" 
                colorScheme={filter.type === 'category' ? categoryColors[filter.value as keyof typeof categoryColors] || 'blue' : 'blue'}
              >
                <TagLabel>{filter.value}</TagLabel>
                <TagCloseButton onClick={() => removeFilter(filter.type, filter.value)} />
              </Tag>
            ))}
            <Button 
              size="xs" 
              variant="ghost" 
              onClick={clearAllFilters} 
              color="blue.500"
              _hover={{
                bg: filterTagBgLight,
                color: filterTagColorLight,
              }}
            >
              Clear all
            </Button>
          </Flex>
        )}
        
        {isLoading ? (
          <Flex justify="center" align="center" minH="300px" direction="column">
            <Spinner size="xl" color="blue.500" thickness="4px" mb={4} />
            <Text color={mutedTextColor} fontWeight="medium">Loading reports...</Text>
          </Flex>
        ) : isError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text color={textColor}>There was an error loading the reports. Please try again later.</Text>
          </Alert>
        ) : filteredPosts.length > 0 ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  image: post.image,
                  images: post.images,
                  created_at: post.created_at,
                  category: post.category as 'physical' | 'verbal' | 'psychological' | 'other',
                  institution: post.institution,
                  user: post.user
                }}
                onClick={() => handleViewPost(post.id)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Box 
            p={8} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={noResultsBorderColor}
            bg={noResultsBoxBg}
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color={textColor}>
              No reports found
            </Heading>
            <Text color={mutedTextColor} fontWeight="medium">
              Try adjusting your search criteria or clear filters
            </Text>
            <Button mt={4} colorScheme="blue" onClick={clearAllFilters} size="sm">
              Clear all filters
            </Button>
          </Box>
        )}
        
        {!isLoading && filteredPosts.length > 0 && (
          <Flex justify="center" mt={12}>
            <Button 
              colorScheme="blue" 
              variant="outline" 
              size="lg"
              onClick={handleCreatePost}
              fontWeight="semibold"
            >
              Share Your Experience
            </Button>
          </Flex>
        )}
      </Container>
    </Box>
  );
} 