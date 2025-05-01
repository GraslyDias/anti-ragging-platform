'use client';

import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Flex,
  Image,
  HStack,
  VStack,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState, useEffect } from 'react';
import API_ENDPOINTS from '../config/api';

// Define the stats interface
interface Stats {
  total_posts: number;
  total_institutions: number;
  total_users: number;
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch statistics from the API
    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getStats);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Stats response:', data);
        
        if (data.status === 'success') {
          setStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to load statistics');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.900');
  const gradientStart = useColorModeValue('blue.50', 'blue.900');
  const gradientEnd = useColorModeValue('white', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const statCardColor = useColorModeValue('gray.500', 'gray.400');

  // Helper function to format number with "+" suffix if greater than 0
  const formatStatNumber = (num: number) => {
    return num > 0 ? num + '+' : '0';
  };

  // Basic rendering when not mounted yet to prevent hydration errors
  if (!mounted) {
    return (
      <Box py={20} bg={bgColor}>
        <Container maxW="7xl">
          <Stack spacing={8} textAlign="center">
            <Skeleton height="60px" width="80%" mx="auto" />
            <Skeleton height="100px" width="60%" mx="auto" />
            <Skeleton height="40px" width="40%" mx="auto" />
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box position="relative" bg={bgColor}>
      {/* Background gradient and pattern */}
      <Box
        position="absolute"
        top={0}
        width="full"
        height="100%"
        bgGradient={`linear(to-b, ${gradientStart}, ${gradientEnd})`}
        zIndex={-1}
        opacity={0.8}
      />
      <Container maxW={'7xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 6, md: 10 }}
          py={{ base: 16, md: 24 }}
          position="relative"
        >
          {/* Main Heading */}
          <Heading
            fontWeight={700}
            fontSize={{ base: '2xl', sm: '3xl', md: '5xl', lg: '6xl' }}
            lineHeight={'110%'}
            color={headingColor}
          >
            Stand Against <br />
            <Text as={'span'} color={accentColor}>
              Ragging in Sri Lanka
            </Text>
          </Heading>

          {/* Hero description */}
          <Text 
            color={descriptionColor} 
            maxW={'3xl'} 
            fontSize={{base: 'md', md: 'lg'}}
            mx={'auto'}
            px={4}
          >
            Join our platform to report and prevent ragging incidents in Sri Lankan campuses. 
            Share your experiences, support others, and help create a safe environment for all students. 
            Together, we can end this harmful practice.
          </Text>

          {/* CTA Buttons */}
          <Stack
            direction={{base: 'column', sm: 'row'}}
            spacing={4}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <Button
              as={NextLink}
              href="/auth/register"
              colorScheme={'blue'}
              bg={accentColor}
              rounded={'full'}
              px={6}
              py={{base: 5, md: 6}}
              fontSize={{base: 'sm', md: 'md'}}
              _hover={{
                bg: 'blue.500',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.3s ease"
            >
              Join the Movement
            </Button>
            <Button 
              as={NextLink}
              href="/posts" 
              variant={'outline'} 
              colorScheme={'blue'} 
              rounded={'full'}
              px={6}
              py={{base: 5, md: 6}}
              fontSize={{base: 'sm', md: 'md'}}
              _hover={{
                bg: useColorModeValue('gray.50', 'gray.700'),
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              transition="all 0.3s ease"
            >
              View Reports
            </Button>
          </Stack>

          {/* Stats Section */}
          <Box mt={{base: 8, md: 10}}>
            <Flex 
              direction={{base: 'column', md: 'row'}}
              gap={{base: 4, md: 8}}
              justify="center"
              mt={{base: 6, md: 10}}
            >
              {isLoading ? (
                <>
                  <StatCardSkeleton bgColor={cardBgColor} borderColor={cardBorderColor} />
                  <StatCardSkeleton bgColor={cardBgColor} borderColor={cardBorderColor} />
                  <StatCardSkeleton bgColor={cardBgColor} borderColor={cardBorderColor} />
                </>
              ) : (
                <>
                  <StatCard 
                    number={formatStatNumber(stats?.total_posts || 0)} 
                    label="Reports Filed" 
                    bgColor={cardBgColor} 
                    borderColor={cardBorderColor} 
                    statColor={statCardColor} 
                    accentColor={accentColor} 
                  />
                  
                  <StatCard 
                    number={formatStatNumber(stats?.total_institutions || 0)} 
                    label="Campuses" 
                    bgColor={cardBgColor} 
                    borderColor={cardBorderColor} 
                    statColor={statCardColor} 
                    accentColor={accentColor} 
                  />
                  
                  <StatCard 
                    number={formatStatNumber(stats?.total_users || 0)} 
                    label="Active Members" 
                    bgColor={cardBgColor} 
                    borderColor={cardBorderColor} 
                    statColor={statCardColor} 
                    accentColor={accentColor} 
                  />
                </>
              )}
            </Flex>
          </Box>

          {/* Feature Section */}
          <Box mt={{base: 10, md: 20}}>
            <Stack 
              direction={{base: 'column', md: 'row'}} 
              spacing={{base: 8, md: 10}} 
              align="start" 
              w="full"
              px={{base: 4, md: 0}}
            >
              <FeatureCard 
                title="Share Your Story" 
                description="Document your experiences to help others and bring awareness."
                icon={<ShieldIcon color={accentColor} boxSize={{base: 8, md: 10}} />}
                textColor={descriptionColor}
              />
              <FeatureCard 
                title="Find Support" 
                description="Connect with others who have faced similar situations."
                icon={<HeartIcon color="red.400" boxSize={{base: 8, md: 10}} />}
                textColor={descriptionColor}
              />
              <FeatureCard 
                title="Create Change" 
                description="Together we can build safer educational environments."
                icon={<StarIcon color="yellow.400" boxSize={{base: 8, md: 10}} />}
                textColor={descriptionColor}
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

// Statistic Card Skeleton
const StatCardSkeleton = ({ 
  bgColor, 
  borderColor 
}: { 
  bgColor: string;
  borderColor: string;
}) => {
  return (
    <VStack 
      p={{base: 4, md: 5}} 
      shadow="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      borderRadius="lg" 
      bg={bgColor} 
      minW={{base: "120px", md: "150px"}}
      _hover={{
        transform: 'translateY(-5px)',
        shadow: 'lg',
      }}
      transition="all 0.3s ease"
    >
      <Skeleton height="30px" width="70px" mb={2} />
      <Skeleton height="20px" width="90px" />
    </VStack>
  );
};

// Statistic Card Component
const StatCard = ({ 
  number, 
  label, 
  bgColor, 
  borderColor, 
  statColor, 
  accentColor 
}: { 
  number: string; 
  label: string; 
  bgColor: string;
  borderColor: string;
  statColor: string;
  accentColor: string;
}) => {
  return (
    <VStack 
      p={{base: 4, md: 5}} 
      shadow="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      borderRadius="lg" 
      bg={bgColor} 
      minW={{base: "120px", md: "150px"}}
      _hover={{
        transform: 'translateY(-5px)',
        shadow: 'lg',
      }}
      transition="all 0.3s ease"
    >
      <Text fontWeight="bold" fontSize={{base: "2xl", md: "3xl"}} color={accentColor}>
        {number}
      </Text>
      <Text color={statColor} fontSize={{base: "sm", md: "md"}}>
        {label}
      </Text>
    </VStack>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  textColor 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  textColor: string;
}) => {
  return (
    <VStack 
      align={{base: "center", md: "flex-start"}} 
      p={5} 
      flex="1"
      spacing={4}
      textAlign={{base: "center", md: "left"}}
    >
      <Box>{icon}</Box>
      <Text fontWeight="bold" fontSize={{base: "lg", md: "xl"}}>{title}</Text>
      <Text color={textColor} fontSize={{base: "sm", md: "md"}}>{description}</Text>
    </VStack>
  );
};

// Custom icons
const ShieldIcon = createIcon({
  displayName: 'ShieldIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1L12,1z M12,11.99h7c-0.53,4.12-3.28,7.79-7,8.94V12H5V6.3l7-3.11V11.99z"
    />
  ),
});

const HeartIcon = createIcon({
  displayName: 'HeartIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z"
    />
  ),
});

const StarIcon = createIcon({
  displayName: 'StarIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12,17.27L18.18,21l-1.64-7.03L22,9.24l-7.19-0.61L12,2L9.19,8.63L2,9.24l5.46,4.73L5.82,21L12,17.27z"
    />
  ),
}); 