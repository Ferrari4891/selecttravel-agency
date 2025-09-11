import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface FooterProps {
  themeClass?: string;
}

const Footer = ({ themeClass }: FooterProps) => {
  const { user } = useAuth();
  const { showLanguagePopup } = useLanguage();

  return (
    <div className={`${themeClass} hidden`}>
      <footer className="text-foreground py-1 mt-auto bg-white">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-center text-xs leading-tight">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link to="/about-us" className="hover:opacity-80 transition-opacity">
              About Us
            </Link>
            <Link to="/how-to" className="hover:opacity-80 transition-opacity">
              How To
            </Link>
            <div className="flex flex-col gap-2 text-center">
              <Link to="/advertise" className="hover:opacity-80 transition-opacity">
                Advertise
              </Link>
              <Link to="/roi" className="hover:opacity-80 transition-opacity text-sm text-primary-foreground/80">
                ROI Calculator
              </Link>
            </div>
            <Link to="/toolbox" className="hover:opacity-80 transition-opacity">
              Toolbox
            </Link>
            <Link to="/visa-info" className="hover:opacity-80 transition-opacity">
              Visa Info
            </Link>
            <Link to="/tv-channel" className="hover:opacity-80 transition-opacity">
              TV Channel
            </Link>
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
              Dashboard
            </Link>
            {!user && (
              <Link to="/join-free" className="hover:opacity-80 transition-opacity">
                Join Free
              </Link>
            )}
            {user && (
              <>
                <Link to="/user-dashboard" className="hover:opacity-80 transition-opacity">
                  My Preferences
                </Link>
                <Link to="/collections" className="hover:opacity-80 transition-opacity">
                  My Collections
                </Link>
              </>
            )}
            {user ? (
              <Link to="/business-dashboard" className="hover:opacity-80 transition-opacity">
                Business Dashboard
              </Link>
            ) : (
              <Link to="/business-login" className="hover:opacity-80 transition-opacity">
                Business Login
              </Link>
            )}
            <a href="mailto:contact@smartguidebooks.com" className="hover:opacity-80 transition-opacity">
              Contact Us
            </a>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => showLanguagePopup()}
                className="rounded-none"
              >
                🌍 Language
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Footer;