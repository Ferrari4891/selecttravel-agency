import { Link } from "react-router-dom";
interface FooterProps {
  themeClass?: string;
  onLanguageClick?: () => void;
}
const Footer = ({
  themeClass,
  onLanguageClick
}: FooterProps) => {
  return <div className={themeClass}>
      <footer className="text-primary-foreground py-8 mt-auto bg-sky-500">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <Link to="/about-us" className="hover:opacity-80 transition-opacity">
              About Us
            </Link>
            <div className="flex flex-col gap-2 text-center">
              <Link to="/advertise" className="hover:opacity-80 transition-opacity">
                Advertise
              </Link>
              <Link to="/roi" className="hover:opacity-80 transition-opacity text-sm text-primary-foreground/80">
                ROI Calculator
              </Link>
            </div>
            <Link to="/how-to" className="hover:opacity-80 transition-opacity">
              How To
            </Link>
            <Link to="/toolbox" className="hover:opacity-80 transition-opacity">
              Toolbox
            </Link>
            <Link to="/visa-info" className="hover:opacity-80 transition-opacity">
              Visa Info
            </Link>
            <Link to="/members" className="hover:opacity-80 transition-opacity">
              Members
            </Link>
            <Link to="/join-free" className="hover:opacity-80 transition-opacity">
              Join Free
            </Link>
            <a href="mailto:contact@smartguides.live" className="hover:opacity-80 transition-opacity">
              Contact Us
            </a>
            <button onClick={onLanguageClick} className="hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none text-primary-foreground underline">
              Language
            </button>
          </div>
        </div>
      </footer>
    </div>;
};
export default Footer;