import { RestaurantDiscoveryForm } from '@/components/RestaurantDiscoveryForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0 p-2">
          <div className="relative h-full border-8 border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
            <img 
              src="/lovable-uploads/77ea3d0b-72bf-4312-91e7-76d3574d3e68.png"
              alt="Smart Guides Live - Experience the World, Your Way"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20">
              <div className="flex flex-col justify-center items-center h-full text-center px-4">
                <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
                  SMART GUIDES LIVE
                </h1>
                <p className="text-white text-xl md:text-2xl mb-8">
                  Experience the World, Your Way
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Restaurant Discovery Form */}
      <div className="py-16">
        <RestaurantDiscoveryForm />
      </div>
    </div>
  );
};

export default Index;
