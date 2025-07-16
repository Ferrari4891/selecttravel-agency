import heroHowTo from "@/assets/hero-how-to.jpg";
const HowToHero = () => {
  return <div className="relative h-64 md:h-80 overflow-hidden border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)]">
      <img src={heroHowTo} alt="How To Hero" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white md:text-9xl">
          HOW TO
        </h1>
      </div>
    </div>;
};
export default HowToHero;