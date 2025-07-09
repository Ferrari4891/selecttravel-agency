import { Link } from "react-router-dom";

interface FooterProps {
  themeClass?: string;
}

const Footer = ({ themeClass }: FooterProps) => {
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
            <a 
              href="mailto:contact@smartguides.live" 
              className="hover:opacity-80 transition-opacity"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;