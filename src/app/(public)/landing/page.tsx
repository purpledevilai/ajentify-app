import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SixPrimitivesSection from './components/SixPrimitivesSection';
import ForCodingAgentsSection from './components/ForCodingAgentsSection';
import WhyAjentifySection from './components/WhyAjentifySection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <div>
            <Header />
            <HeroSection />
            <SixPrimitivesSection />
            <ForCodingAgentsSection />
            <WhyAjentifySection />
            <Footer />
        </div>
    );
}
