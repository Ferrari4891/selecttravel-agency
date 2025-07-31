import React from 'react';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SharedCollection: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Shared Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Shared collections feature is coming soon. You'll be able to view collections shared by other users here.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SharedCollection;