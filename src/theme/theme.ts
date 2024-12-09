import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50: '#f3e9fd',
            100: '#e1c8fb',
            200: '#d1a9f9',
            300: '#c18af7',
            400: '#a95cf3',
            500: '#7a15e6', // Primary
            600: '#6712c1',
            700: '#550e9e',
            800: '#430a7a',
            900: '#320758',
        },
        gray: {
            50: '#f9fafb',
            100: '#f2f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        },
        green: {
            50: '#e6f9f1',
            100: '#c7f2df',
            200: '#8ce4bf',
            300: '#61d4a1',
            400: '#38c78d',
            500: '#28a974',
            600: '#1f865d',
            700: '#176747',
        },
        red: {
            500: '#e53e3e',
        },
        yellow: {
            500: '#ecc94b',
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'bold', // Applies to all buttons
            },
            variants: {
                solid: (props: { colorMode: string; }) => ({
                    bg: props.colorMode === 'light' ? 'brand.500' : 'brand.500',
                    color: 'white',
                    _hover: {
                        bg: props.colorMode === 'light' ? 'brand.400' : 'brand.400',
                    },
                }),
                outline: (props: { colorMode: string; }) => ({
                    borderColor: props.colorMode === 'light' ? 'brand.500' : 'brand.300',
                    color: props.colorMode === 'light' ? 'brand.500' : 'brand.300',
                    _hover: {
                        bg: props.colorMode === 'light' ? 'brand.100' : 'brand.700',
                    },
                }),
            },
            defaultProps: {
                variant: 'solid', // Default variant
                colorScheme: 'brand', // Default color scheme
            },
        },
        Input: {
            baseStyle: {
                // Shared styles for all variants
            },
            sizes: {
                // Custom sizes if needed
            },
            variants: {
                filled: {
                    field: {
                        borderColor: 'gray.300',
                        _hover: { borderColor: 'gray.400' }, // Hover state
                        _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }, // Focus state
                    },
                },
            },
            defaultProps: {
                variant: 'filled', // Set the default variant for all Inputs
            },
        },
    },
    fonts: {
        heading: `'Inter', sans-serif`,
        body: `'Inter', sans-serif`,
    },
});
export default theme;
