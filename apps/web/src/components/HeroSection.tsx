import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import dashboardPreview from "@/assets/dashboard-preview.png";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-start min-h-screen px-6 md:px-12 pt-12 overflow-hidden">
      {/* Text Content - Left aligned */}
      <div className="max-w-4xl text-left space-y-8 relative z-10 mb-8">
        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-hero-title leading-tight tracking-tight">
          Centralisez vos demandes. Recevez des devis fiables, en toute simplicité.
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-hero-subtitle leading-relaxed max-w-3xl">
          Notre système de matching identifie automatiquement les meilleurs fournisseurs, leur envoie votre demande, et centralise leurs devis pour vous.
        </p>
        
        {/* CTA Button */}
        <div className="flex pt-4">
            <Link to="/auth">
              <Button
                size="default"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-normal"
              >
                Déposer un besoin
              </Button>
            </Link>

        </div>
      </div>

      {/* Dashboard Mockup - Laid flat, fading to right edge */}
      <div className="relative w-full max-w-[1600px] mx-auto -mr-64 -mt-48" style={{ perspective: '2000px' }}>
        <div 
          className="relative w-full"
          style={{
            transform: 'rotateX(35deg) rotateY(18deg) rotateZ(-25deg)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center right'
          }}
        >
          {/* Dashboard Image */}
          <div 
            className="relative rounded-2xl overflow-hidden border border-zinc-800/30 bg-gradient-to-br from-zinc-900/50 to-black/50"
            style={{
              boxShadow: '0 -40px 100px -20px rgba(0, 0, 0, 0.8), 0 -20px 60px -30px rgba(0, 0, 0, 0.6)'
            }}
          >
          <img 
            src={dashboardPreview} 
            alt="Everlake Dashboard Preview" 
            className="w-full h-auto opacity-100"
            style={{ imageRendering: 'crisp-edges' }}
          />
          {/* Subtle fade to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent from-60% via-background/10 via-80% to-background/40 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;