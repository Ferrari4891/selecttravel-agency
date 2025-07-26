import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginGate from '@/pages/LoginGate';

interface SiteAuthGuardProps {
  children: React.ReactNode;
}

const SiteAuthGuard: React.FC<SiteAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('siteAuthenticated') === 'true';
      console.log('SiteAuthGuard checking auth:', authenticated);
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for focus events to recheck when returning to tab
    const handleFocus = () => {
      checkAuth();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    console.log('SiteAuthGuard: Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login gate
  if (!isAuthenticated) {
    console.log('SiteAuthGuard: Not authenticated, showing login');
    return <LoginGate />;
  }

  // If authenticated, show the protected content
  console.log('SiteAuthGuard: Authenticated, showing main content');
  return <>{children}</>;
};

export default SiteAuthGuard;