import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2 } from 'lucide-react';

interface AddAmenityDialogProps {
  onAmenityAdded?: () => void;
}

export const AddAmenityDialog = ({ onAmenityAdded }: AddAmenityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Display name is required',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create option_key from display_name (lowercase, underscores)
      const optionKey = displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      // Check if this key already exists
      const { data: existing } = await supabase
        .from('amenity_options')
        .select('id')
        .eq('option_key', optionKey)
        .single();

      if (existing) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An amenity with this name already exists',
        });
        return;
      }

      const { error } = await supabase.from('amenity_options').insert({
        option_key: optionKey,
        display_name: displayName.trim(),
        description: description.trim() || null,
        category: 'custom',
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Amenity option added successfully',
      });

      setDisplayName('');
      setDescription('');
      setOpen(false);
      onAmenityAdded?.();
    } catch (error: any) {
      console.error('Error adding amenity:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add amenity option',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Amenity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Amenity Option</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Free WiFi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this amenity"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Amenity'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
