import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BenefitsSection from './components/BenefitsSection';
import StructuredResponsesSection from './components/StructuredResponsesSection';

export default function LandingPage() {
    return (
        <Box>
            <Header />
            <HeroSection />
            <FeaturesSection />
            <BenefitsSection />
            <StructuredResponsesSection />
        </Box>
    );
} 