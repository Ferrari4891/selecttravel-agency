
import heroHowTo from "@/assets/hero-how-to.jpg";

const HowToHero = () => {
  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      <img 
        src={heroHowTo} 
        alt="How To Hero" 
        className="w-full h-full object-cover border-8 border-white rounded-none shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
      />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          HOW TO
        </h1>
      </div>
    </div>
  );
};

export default HowToHero;
