import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SaveBusinessButtonProps {
  restaurant: any;
  selectedCity: string;
  selectedCountry: string;
  selectedCategory?: string;
}

const SaveBusinessButton: React.FC<SaveBusinessButtonProps> = ({
  restaurant,
  selectedCity,
  selectedCountry,
  selectedCategory
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save businesses.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Simple save notification for now
    toast({
      title: "Business Saved",
      description: `${restaurant.name} has been saved to your favorites.`,
    });
  };

  return (
    <Button
      onClick={handleSave}
      variant="default"
      size="sm"
      className="flex items-center gap-2 w-full bg-black text-white hover:bg-black/90 rounded-none"
    >
      <Heart className="w-4 h-4" />
      SAVE
    </Button>
  );
};

export default SaveBusinessButton;