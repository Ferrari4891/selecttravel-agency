import heroHowTo from "@/assets/hero-how-to.jpg";

const HowToHero = () => {
  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      <img 
        src={heroHowTo} 
        alt="How To Hero" 
        className="w-full h-full object-cover"
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