import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface FooterProps {
  themeClass?: string;
}

const Footer = ({ themeClass }: FooterProps) => {
  const { user } = useAuth();

  return (
    <div className={themeClass}>
      <footer className="text-foreground py-8 mt-auto bg-white border-t-2 border-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
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
            <Link to="/members" className="hover:opacity-80 transition-opacity">
              Members
            </Link>
            <Link to="/join-free" className="hover:opacity-80 transition-opacity">
              Join Free
            </Link>
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
              <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                Business Dashboard
              </Link>
            ) : (
              <Link to="/auth" className="hover:opacity-80 transition-opacity">
                Business Login
              </Link>
            )}
            <a href="mailto:contact@smartguidebooks.com" className="hover:opacity-80 transition-opacity">
              Contact Us
            </a>
            <div className="flex justify-center">
              <LanguageSelector inMenu={false} onClose={() => {}} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Footer;