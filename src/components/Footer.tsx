import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 mt-auto">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <Link 
            to="/about-us" 
            className="hover:text-gray-300 transition-colors"
          >
            About Us
          </Link>
          <Link 
            to="/advertise" 
            className="hover:text-gray-300 transition-colors"
          >
            Advertise
          </Link>
          <Link 
            to="/how-to" 
            className="hover:text-gray-300 transition-colors"
          >
            How To
          </Link>
          <a 
            href="mailto:contact@smartguides.live" 
            className="hover:text-gray-300 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;