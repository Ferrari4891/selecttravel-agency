import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAmenityOptions, type AmenityOption } from '@/hooks/useAmenityOptions';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  'accessibility',
  'dietary',
  'environment',
  'hours',
  'location',
  'policies',
  'seating',
  'pricing',
  'booking',
  'general'
];

interface EditableAmenityOption extends Partial<AmenityOption> {
  option_key: string;
  display_name: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export const AmenityManagement: React.FC = () => {
  const { amenityOptions, isLoading, createAmenityOption, updateAmenityOption, deleteAmenityOption } = useAmenityOptions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAmenity, setNewAmenity] = useState<EditableAmenityOption>({
    option_key: '',
    display_name: '',
    description: '',
    category: 'general',
    is_active: true,
    sort_order: 0,
  });
  const [editingAmenity, setEditingAmenity] = useState<EditableAmenityOption | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewAmenity({
      option_key: '',
      display_name: '',
      description: '',
      category: 'general',
      is_active: true,
      sort_order: amenityOptions.length + 1,
    });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewAmenity({
      option_key: '',
      display_name: '',
      description: '',
      category: 'general',
      is_active: true,
      sort_order: 0,
    });
  };

  const handleCreateAmenity = async () => {
    try {
      await createAmenityOption(newAmenity);
      handleCancelCreate();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStartEdit = (amenity: AmenityOption) => {
    setEditingId(amenity.id);
    setEditingAmenity({ ...amenity });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAmenity(null);
  };

  const handleSaveEdit = async () => {
    if (!editingAmenity || !editingId) return;

    try {
      const { id, created_at, updated_at, ...updates } = editingAmenity;
      await updateAmenityOption(editingId, updates);
      handleCancelEdit();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this amenity option?')) {
      await deleteAmenityOption(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amenity Options Management</CardTitle>
          <CardDescription>Loading amenity options...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenity Options Management</CardTitle>
        <CardDescription>
          Manage the available amenity options for both member preferences and business features.
          Changes here will automatically update both forms.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Amenity */}
        {!isCreating ? (
          <Button onClick={handleStartCreate} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Amenity Option
          </Button>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-key">Option Key</Label>
                  <Input
                    id="new-key"
                    value={newAmenity.option_key}
                    onChange={(e) => setNewAmenity(prev => ({ ...prev, option_key: e.target.value }))}
                    placeholder="e.g., wheelchair_access"
                  />
                </div>
                <div>
                  <Label htmlFor="new-name">Display Name</Label>
                  <Input
                    id="new-name"
                    value={newAmenity.display_name}
                    onChange={(e) => setNewAmenity(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., Wheelchair Access"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-description">Description</Label>
                <Textarea
                  id="new-description"
                  value={newAmenity.description || ''}
                  onChange={(e) => setNewAmenity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this amenity"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-category">Category</Label>
                  <Select
                    value={newAmenity.category}
                    onValueChange={(value) => setNewAmenity(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-sort">Sort Order</Label>
                  <Input
                    id="new-sort"
                    type="number"
                    value={newAmenity.sort_order}
                    onChange={(e) => setNewAmenity(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAmenity.is_active}
                  onCheckedChange={(checked) => setNewAmenity(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateAmenity} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button onClick={handleCancelCreate} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Amenities */}
        <div className="space-y-4">
          {amenityOptions.map((amenity) => (
            <Card key={amenity.id}>
              <CardContent className="p-4">
                {editingId === amenity.id && editingAmenity ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Option Key</Label>
                        <Input
                          value={editingAmenity.option_key}
                          onChange={(e) => setEditingAmenity(prev => prev ? { ...prev, option_key: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label>Display Name</Label>
                        <Input
                          value={editingAmenity.display_name}
                          onChange={(e) => setEditingAmenity(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingAmenity.description || ''}
                        onChange={(e) => setEditingAmenity(prev => prev ? { ...prev, description: e.target.value } : null)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={editingAmenity.category}
                          onValueChange={(value) => setEditingAmenity(prev => prev ? { ...prev, category: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sort Order</Label>
                        <Input
                          type="number"
                          value={editingAmenity.sort_order}
                          onChange={(e) => setEditingAmenity(prev => prev ? { ...prev, sort_order: parseInt(e.target.value) || 0 } : null)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingAmenity.is_active}
                        onCheckedChange={(checked) => setEditingAmenity(prev => prev ? { ...prev, is_active: checked } : null)}
                      />
                      <Label>Active</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{amenity.display_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Key: {amenity.option_key} | Category: {amenity.category} | Order: {amenity.sort_order}
                          </p>
                          {amenity.description && (
                            <p className="text-sm text-muted-foreground mt-1">{amenity.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${amenity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {amenity.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        onClick={() => handleStartEdit(amenity)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(amenity.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
