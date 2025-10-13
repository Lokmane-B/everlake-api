import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero text-hero-title">
      <Navigation />
      <HeroSection />
    </div>
  );
};

export default Homepage;
