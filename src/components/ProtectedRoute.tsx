import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-black text-white px-6 py-3 rounded-lg sm:bg-primary sm:text-primary-foreground">
            <h1 className="text-6xl font-bold mb-8">SGL</h1>
          </div>
          <div className="flex space-x-2 justify-center mt-8">
            <div className="w-3 h-3 bg-foreground rounded-full animate-bounce sm:bg-primary"></div>
            <div className="w-3 h-3 bg-foreground rounded-full animate-bounce sm:bg-primary" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-foreground rounded-full animate-bounce sm:bg-primary" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to /auth via useEffect
  }

  return <>{children}</>;
};