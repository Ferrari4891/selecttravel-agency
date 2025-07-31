import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const Collections: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">My Collections</h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Collections Coming Soon</h3>
              <p>Save and organize your favorite businesses into collections.</p>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Collections;