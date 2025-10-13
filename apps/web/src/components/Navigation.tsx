import { Button } from "@/components/ui/button";
import logo from "@/assets/everlake-logo.png";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-border">
      <div className="flex items-center gap-0.5">
        <img src={logo} alt="Everlake" className="w-12 h-12" />
        <span className="text-hero-title font-medium text-base">Everlake</span>
      </div>

      <div className="flex items-center space-x-3">
        <Link to="/auth">
          <Button
            variant="ghost"
            size="sm"
            className="text-hero-subtitle hover:text-hero-title hover:bg-accent"
          >
            Connexion
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="border-hero-button-primary text-hero-button-primary hover:bg-hero-button-primary hover:text-hero-button-primary-text"
        >
          Demander une démonstration
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
