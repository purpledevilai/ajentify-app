import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';

export default function LandingPage() {
    return (
        <Box>
            <Header />
            <HeroSection />
            <FeaturesSection />
        </Box>
    );
}
