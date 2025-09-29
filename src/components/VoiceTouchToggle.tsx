import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Hand, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface VoiceTouchToggleProps {
  onModeChange: (mode: 'voice' | 'touch') => void;
  className?: string;
}

export const VoiceTouchToggle = ({ onModeChange, className = "" }: VoiceTouchToggleProps) => {
  const [currentMode, setCurrentMode] = useState<'voice' | 'touch'>('touch');
  const [showMembershipTeaser, setShowMembershipTeaser] = useState(false);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleModeSwitch = (newMode: 'voice' | 'touch') => {
    // If switching to voice and user is not authenticated, show membership teaser
    if (newMode === 'voice' && !user) {
      setShowMembershipTeaser(true);
      return;
    }

    setCurrentMode(newMode);
    onModeChange(newMode);
  };

  const handleJoinMembership = () => {
    setShowMembershipTeaser(false);
    navigate('/join-free');
  };

  const handleContinueManually = () => {
    setShowMembershipTeaser(false);
    setCurrentMode('voice');
    onModeChange('voice');
  };

  return (
    <>
      <div className={`flex items-center gap-2 p-2 bg-card rounded-lg border ${className}`}>
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Button
            variant={currentMode === 'touch' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeSwitch('touch')}
            className="flex items-center gap-2 h-8"
          >
            <Hand className="h-4 w-4" />
            <span className="text-xs">Touch</span>
          </Button>
          <Button
            variant={currentMode === 'voice' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeSwitch('voice')}
            className="flex items-center gap-2 h-8"
          >
            <Mic className="h-4 w-4" />
            <span className="text-xs">Voice</span>
          </Button>
        </div>
        
        {user && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Settings className="h-3 w-3" />
            <span>Auto-language</span>
          </div>
        )}
      </div>

      <Dialog open={showMembershipTeaser} onOpenChange={setShowMembershipTeaser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Voice Feature Available
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-center">
                <strong>Save time become a member it's free</strong>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Members enjoy automatic language preferences and seamless voice features
              </p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleJoinMembership}
                  className="w-full"
                >
                  See Benefits of Membership
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleContinueManually}
                  className="w-full"
                >
                  Close and Continue Manually
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};