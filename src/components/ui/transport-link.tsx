import React from 'react';
import { ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransportLinkProps {
  appName: 'Grab' | 'Uber';
  deepLink: string;
  destination: string;
}

export function TransportLink({ appName, deepLink, destination }: TransportLinkProps) {
  const handleClick = () => {
    // Try to open the app first
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    
    // Set a timeout to redirect to app store if app doesn't open
    setTimeout(() => {
      document.body.removeChild(iframe);
      
      // Detect platform and redirect to appropriate store
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let storeUrl = '';
      
      if (appName === 'Grab') {
        if (isIOS) {
          storeUrl = 'https://apps.apple.com/app/grab/id647268330';
        } else if (isAndroid) {
          storeUrl = 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger';
        } else {
          storeUrl = 'https://www.grab.com/downloads/';
        }
      } else if (appName === 'Uber') {
        if (isIOS) {
          storeUrl = 'https://apps.apple.com/app/uber/id368677368';
        } else if (isAndroid) {
          storeUrl = 'https://play.google.com/store/apps/details?id=com.ubercab';
        } else {
          storeUrl = 'https://www.uber.com/mobile/';
        }
      }
      
      if (storeUrl) {
        window.open(storeUrl, '_blank');
      }
    }, 1500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2 rounded-none"
    >
      <Smartphone className="h-4 w-4" />
      Book {appName}
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
}