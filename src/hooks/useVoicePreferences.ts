import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface VoicePreferences {
  voice_enabled: boolean;
  audio_enabled: boolean;
  voice_preference: string;
  updated_at: string;
}

const defaultPreferences: VoicePreferences = {
  voice_enabled: false,
  audio_enabled: true,
  voice_preference: 'english-female',
  updated_at: new Date().toISOString()
};

export const useVoicePreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<VoicePreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    setIsLoading(true);
    
    try {
      // For now, always load from localStorage until database migration is complete
      const localPrefs = localStorage.getItem('voicePreferences');
      const preferencesShown = localStorage.getItem('voicePreferencesShown');
      
      if (localPrefs) {
        setPreferences(JSON.parse(localPrefs));
      } else if (!preferencesShown) {
        // First time visitor - show preferences dialog
        setShowPreferencesDialog(true);
      }
    } catch (error) {
      console.error('Error loading voice preferences:', error);
      // Show preferences dialog for first-time users
      const preferencesShown = localStorage.getItem('voicePreferencesShown');
      if (!preferencesShown) {
        setShowPreferencesDialog(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<VoicePreferences>) => {
    const updated = { ...preferences, ...newPreferences, updated_at: new Date().toISOString() };
    setPreferences(updated);

    try {
      // For now, always save to localStorage until database migration is complete
      localStorage.setItem('voicePreferences', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating voice preferences:', error);
      localStorage.setItem('voicePreferences', JSON.stringify(updated));
    }
  };

  const handlePreferencesSaved = (voiceEnabled: boolean) => {
    updatePreferences({ voice_enabled: voiceEnabled });
    localStorage.setItem('voicePreferencesShown', 'true');
    setShowPreferencesDialog(false);
  };

  return {
    preferences,
    isLoading,
    showPreferencesDialog,
    setShowPreferencesDialog,
    updatePreferences,
    handlePreferencesSaved,
    loadPreferences
  };
};