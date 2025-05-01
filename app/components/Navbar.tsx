'use client';

import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  HStack,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Container,
  Image,
  Stack,
  Collapse,
  Link,
  useColorMode,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  VisuallyHidden,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import Logo from './Logo';

// Add the SkipLink component at the beginning of Navbar
const SkipLink = () => {
  return (
    <Box
      as="a"
      href="#main-content"
      position="absolute"
      top="-40px"
      left="0"
      zIndex="skip"
      bg="blue.500"
      color="white"
      padding="8px"
      _focus={{
        top: "0",
        transition: "top 0.2s"
      }}
    >
      <VisuallyHidden>Skip to content</VisuallyHidden>
    </Box>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const userTextColor = useColorModeValue('gray.700', 'gray.200');
  const gradientStart = useColorModeValue('blue.400', 'blue.300');
  const gradientEnd = useColorModeValue('teal.400', 'teal.200');
  
  useEffect(() => {
    setMounted(true);
    // Check if user is logged in - only run on client
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(userData.name || '');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserName('');
      router.push('/');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  };

  // Only render user-specific content when mounted (client-side)
  const authContent = mounted ? (
    isLoggedIn ? (
      <>
        <Text color={textColor} fontSize="sm">
          Welcome, <Text as="span" fontWeight="bold" color={userTextColor}>{userName}</Text>
        </Text>
        <Button
          onClick={handleLogout}
          size="sm"
          variant="outline"
          colorScheme="red"
        >
          Logout
        </Button>
      </>
    ) : (
      <>
        <Button
          as={NextLink}
          href="/auth/login"
          size="sm"
          variant="ghost"
          colorScheme="blue"
        >
          Login
        </Button>
        <Button
          as={NextLink}
          href="/auth/register"
          size="sm"
          colorScheme="blue"
        >
          Sign Up
        </Button>
      </>
    )
  ) : null;

  return (
    <Box 
      position="sticky" 
      top="0" 
      zIndex="999" 
      boxShadow="0 2px 10px rgba(0,0,0,0.05)"
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Container maxW="7xl">
        <Flex
          color={textColor}
          minH={'60px'}
          py={{ base: 3 }}
          align={'center'}
          justify="space-between"
        >
          <SkipLink />
          <NextLink href="/" passHref>
            <Text
              fontWeight="bold"
              fontSize="xl" 
              bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
              bgClip="text"
              letterSpacing="tight"
              cursor="pointer"
            >
              Anti-Ragging Platform
            </Text>
          </NextLink>

          {/* Desktop nav */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            <NavLinks isLoggedIn={isLoggedIn} />
            <HStack spacing={4}>
              {authContent}
            </HStack>
          </HStack>

          {/* Mobile nav toggle */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
      </Container>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <NextLink href="/" passHref>
              <Text
                fontWeight="bold"
                fontSize="lg" 
                bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
                bgClip="text"
                letterSpacing="tight"
                cursor="pointer"
              >
                Anti-Ragging Platform
              </Text>
            </NextLink>
          </DrawerHeader>
          <DrawerBody>
            <VStack align="start" spacing={6} mt={6}>
              <NavLinks isLoggedIn={isLoggedIn} direction="column" />
              
              {mounted && (
                isLoggedIn ? (
                  <>
                    <Text color={textColor} fontSize="sm" pt={4}>
                      Welcome, <Text as="span" fontWeight="bold" color={userTextColor}>{userName}</Text>
                    </Text>
                    <Button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      w="full"
                      colorScheme="red"
                      mt={2}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      as={NextLink}
                      href="/auth/login"
                      w="full"
                      variant="outline"
                      colorScheme="blue"
                      onClick={onClose}
                      mt={4}
                    >
                      Login
                    </Button>
                    <Button
                      as={NextLink}
                      href="/auth/register"
                      w="full"
                      colorScheme="blue"
                      onClick={onClose}
                    >
                      Sign Up
                    </Button>
                  </>
                )
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

interface NavLinksProps {
  isLoggedIn: boolean;
  direction?: 'row' | 'column';
}

const NavLinks = ({ isLoggedIn, direction = 'row' }: NavLinksProps) => {
  const Stack = direction === 'row' ? HStack : VStack;
  const linkProps = direction === 'column' ? { w: 'full' } : {};
  
  const links = [
    { label: 'Home', href: '/', alwaysShow: true },
    { label: 'Reports', href: '/posts', alwaysShow: true },
    { label: 'Dashboard', href: '/dashboard', alwaysShow: false },
    { label: 'Profile', href: '/profile', alwaysShow: false },
  ];

  return (
    <Stack spacing={direction === 'row' ? 6 : 4} align={direction === 'column' ? 'start' : 'center'}>
      {links.map((link) => (
        (link.alwaysShow || isLoggedIn) && (
          <Button 
            key={link.href}
            as={NextLink}
            href={link.href}
            variant="ghost"
            colorScheme="blue"
            size="sm"
            {...linkProps}
          >
            {link.label}
          </Button>
        )
      ))}
    </Stack>
  );
}; 