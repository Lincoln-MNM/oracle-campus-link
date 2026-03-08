import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import LandingNavbar from "@/components/Landing/LandingNavbar";
import HeroSection from "@/components/Landing/HeroSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import HowItWorksSection from "@/components/Landing/HowItWorksSection";
import LoginGateway from "@/components/Landing/LoginGateway";
import Footer from "@/components/Landing/Footer";

const LandingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <LoginGateway />
      <Footer />
    </div>
  );
};

export default LandingPage;
