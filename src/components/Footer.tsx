import { Link } from "react-router-dom";

interface FooterProps {
  themeClass?: string;
  onLanguageClick?: () => void;
}

const Footer = ({ themeClass, onLanguageClick }: FooterProps) => {
  return (
    <div className={themeClass}>
      <footer className="bg-primary text-primary-foreground py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <Link 
              to="/about-us" 
              className="hover:opacity-80 transition-opacity"
            >
              About Us
            </Link>
            <Link 
              to="/advertise" 
              className="hover:opacity-80 transition-opacity"
            >
              Advertise
            </Link>
            <Link 
              to="/how-to" 
              className="hover:opacity-80 transition-opacity"
            >
              How To
            </Link>
            <Link 
              to="/toolbox" 
              className="hover:opacity-80 transition-opacity"
            >
              Toolbox
            </Link>
            <Link 
              to="/visa-info" 
              className="hover:opacity-80 transition-opacity"
            >
              Visa Info
            </Link>
            <a 
              href="mailto:contact@smartguides.live" 
              className="hover:opacity-80 transition-opacity"
            >
              Contact Us
            </a>
            <button 
              onClick={onLanguageClick}
              className="hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none text-primary-foreground underline"
            >
              Language
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;