import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

const UserDashboard: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">User Dashboard</h1>
          
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Dashboard Coming Soon</h3>
              <p>Manage your profile, preferences, and saved businesses.</p>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default UserDashboard;