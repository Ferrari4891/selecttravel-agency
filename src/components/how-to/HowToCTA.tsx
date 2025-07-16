import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowToCTA = () => {
  return (
    <div className="text-center">
      <Link to="/">
        <Button size="lg" className="bg-gradient-primary">
          START HERE
        </Button>
      </Link>
    </div>
  );
};

export default HowToCTA;