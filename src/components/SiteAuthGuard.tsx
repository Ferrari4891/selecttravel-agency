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
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login gate
  if (!isAuthenticated) {
    return <LoginGate />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};

export default SiteAuthGuard;