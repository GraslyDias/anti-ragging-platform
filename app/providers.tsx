'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react'

// Define the theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  } as ThemeConfig,
  colors: {
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
    blue: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE',
      600: '#2B6CB0',
      700: '#2C5282',
      800: '#2A4365',
      900: '#1A365D',
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      }
    })
  },
  components: {
    Heading: {
      baseStyle: (props: StyleFunctionProps) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      })
    },
    Text: {
      baseStyle: (props: StyleFunctionProps) => ({
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      })
    },
    Box: {
      baseStyle: {
        borderRadius: 'md',
      }
    },
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      }
    },
    Card: {
      baseStyle: (props: StyleFunctionProps) => ({
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        boxShadow: 'md',
      })
    }
  }
})

export function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme} resetCSS>
        {children}
      </ChakraProvider>
    </CacheProvider>
  )
} 