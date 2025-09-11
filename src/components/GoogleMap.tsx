import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapProps {
  address?: string;
  city?: string;
  country?: string;
  className?: string;
  height?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  address,
  city,
  country,
  className = "",
  height = "300px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if we have address data
      if (!address && !city) {
        setError("No location data available");
        setIsLoading(false);
        return;
      }

      try {
        // Get Google Maps API key from Supabase function with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const apiKeyPromise = supabase.functions.invoke('get-google-maps-key');
        
        const { data, error: keyError } = await Promise.race([apiKeyPromise, timeoutPromise]) as any;
        
        if (keyError || !data?.apiKey) {
          console.error('Google Maps API key fetch error:', keyError);
          setError("Map preview unavailable (API key not configured)");
          setIsLoading(false);
          return;
        }

        const apiKey = data.apiKey;

        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;

          script.onload = () => initializeMap();
          script.onerror = () => {
            setError("Failed to load Google Maps");
            setIsLoading(false);
          };

          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (err) {
        setError("Error loading map");
        setIsLoading(false);
      }
    };

    const initializeMap = async () => {
      if (!mapRef.current || !window.google) return;

      try {
        const geocoder = new window.google.maps.Geocoder();
        const searchAddress = [address, city, country].filter(Boolean).join(', ');

        // Geocode the address
        geocoder.geocode({ address: searchAddress }, (results, status) => {
          try {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              
              // Create the map
              const map = new window.google.maps.Map(mapRef.current!, {
                center: location,
                zoom: 15,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                  }
                ]
              });

              // Add a marker
              new window.google.maps.Marker({
                position: location,
                map: map,
                title: searchAddress,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF6B6B"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 32)
                }
              });
            } else {
              console.error('Geocode failed:', status, results);
              setError("Location not found");
            }
          } catch (e) {
            console.error('Map initialization error:', e);
            setError("Error initializing map");
          } finally {
            setIsLoading(false);
          }
        });
      } catch (err) {
        setError("Error initializing map");
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, [address, city, country]);

  if (error) {
    return (
      <div 
        className={`${className} bg-muted rounded-lg flex items-center justify-center text-muted-foreground`}
        style={{ height }}
      >
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className={`${className} bg-muted rounded-lg flex items-center justify-center`}
        style={{ height }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`${className} rounded-lg border`}
      style={{ height }}
    />
  );
};

// Extend the Window interface to include Google Maps
declare global {
  interface Window {
    google: any;
  }
}