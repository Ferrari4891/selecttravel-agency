import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileRestaurantForm } from '@/components/MobileRestaurantForm';
import { RestaurantDiscoveryForm } from '@/components/RestaurantDiscoveryForm';

const Index: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      {/* Use proper mobile and desktop components */}
      {isMobile ? (
        <MobileRestaurantForm />
      ) : (
        <RestaurantDiscoveryForm />
      )}
    </div>
  );
};

export default Index;