import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SixPrimitivesSection from './components/SixPrimitivesSection';
import ForCodingAgentsSection from './components/ForCodingAgentsSection';
import WhyAjentifySection from './components/WhyAjentifySection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <Box>
            <Header />
            <HeroSection />
            <SixPrimitivesSection />
            <ForCodingAgentsSection />
            <WhyAjentifySection />
            <Footer />
        </Box>
    );
}
