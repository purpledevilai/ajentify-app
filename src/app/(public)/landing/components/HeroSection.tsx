import { Box, Button, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <Box
            as="section"
            bg="brand.500"
            color="white"
            textAlign="center"
            py="10"
            px="6"
        >
            <Heading as="h1" size="2xl" mb="4">
                Welcome to Ajentify
            </Heading>
            <Text fontSize="lg" mb="6">
                We&apos;re so glad you&apos;re here. If you&apos;re building with LLMs, you&apos;re in the right place.
            </Text>

            <Link href="/signup" passHref>
                <Button bg="brand.300" size="lg">
                    Get Started
                </Button>
            </Link>
        </Box>
    );
}
