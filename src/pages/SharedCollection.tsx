import React from 'react';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Share2 } from 'lucide-react';

const SharedCollection: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Shared Collections Coming Soon</h3>
            <p>Share your favorite business collections with friends and family.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SharedCollection;