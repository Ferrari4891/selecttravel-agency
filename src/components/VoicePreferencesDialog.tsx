import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VoicePreferencesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPreferencesSaved: (enabled: boolean) => void;
}

export const VoicePreferencesDialog: React.FC<VoicePreferencesDialogProps> = ({
  isOpen,
  onOpenChange,
  onPreferencesSaved
}) => {
  const { user } = useAuth();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Test voice synthesis
  const testVoice = () => {
    if ('speechSynthesis' in window && audioEnabled) {
      const utterance = new SpeechSynthesisUtterance(
        "Hello! This is how I sound. I'm here to help you navigate our website using voice commands."
      );
      
      // Set mid-Atlantic middle-aged woman voice preferences
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      
      // Try to find a suitable female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Karen') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Susan') ||
        voice.lang.includes('en-US') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.includes('en-US')) || voices[0];
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    
    try {
      const preferences = {
        voice_enabled: voiceEnabled,
        audio_enabled: audioEnabled,
        voice_preference: 'mid-atlantic-female',
        updated_at: new Date().toISOString()
      };

      // For now, always save to local storage until database migration is complete
      localStorage.setItem('voicePreferences', JSON.stringify(preferences));
      
      if (user) {
        toast({
          title: "Preferences Saved",
          description: "Your voice preferences have been saved locally. Database sync coming soon!",
        });
      } else {
        toast({
          title: "Preferences Saved Locally",
          description: "Your voice preferences have been saved. Sign up to sync across devices!",
        });
      }

      onPreferencesSaved(voiceEnabled);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipForNow = () => {
    // Save minimal preferences
    const preferences = {
      voice_enabled: false,
      audio_enabled: true,
      voice_preference: 'mid-atlantic-female',
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('voicePreferences', JSON.stringify(preferences));
    localStorage.setItem('voicePreferencesShown', 'true');
    
    onPreferencesSaved(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Navigation Setup
          </DialogTitle>
          <DialogDescription>
            Welcome! Would you like to enable voice commands to navigate our forms? 
            This feature is designed to be senior-friendly and easy to use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="voice-enabled" className="text-base font-medium">
                  Enable Voice Commands
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use voice to fill out forms and navigate
                </p>
              </div>
              <Switch
                id="voice-enabled"
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="audio-enabled" className="text-base font-medium">
                  Audio Feedback
                </Label>
                <p className="text-sm text-muted-foreground">
                  Hear spoken responses and instructions
                </p>
              </div>
              <Switch
                id="audio-enabled"
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
              />
            </div>
          </div>

          {audioEnabled && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Test Voice</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testVoice}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click "Listen" to hear how the voice assistant sounds
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={savePreferences} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : voiceEnabled ? "Enable Voice Navigation" : "Save Preferences"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={skipForNow}
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {user 
              ? "Preferences will be saved to your account" 
              : "Preferences will be saved locally. Sign up to sync across devices!"
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};