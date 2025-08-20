import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Use existing speech recognition types
interface VoiceNavigationProps {
  currentStep: 1 | 2 | 3 | 4;
  selectedCountry: string;
  selectedCuisine: string;
  selectedCity: string;
  availableCountries: string[];
  availableCuisines: string[];
  availableCities: string[];
  businesses: any[];
  onCountrySelect: (country: string) => void;
  onCuisineSelect: (cuisine: string) => void;
  onCitySelect: (city: string) => void;
  onGetNow: () => void;
  onBusinessSelect?: (business: any) => void;
  voicePreferences?: {
    voice_enabled: boolean;
    audio_enabled: boolean;
    voice_preference: string;
  };
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  isWaitingForConfirmation: boolean;
  pendingSelection: string;
  pendingType: 'country' | 'cuisine' | 'city' | null;
  audioEnabled: boolean;
  selectedBusinessIndex: number;
  voiceEnabled: boolean;
}

export const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  currentStep,
  selectedCountry,
  selectedCuisine,
  selectedCity,
  availableCountries,
  availableCuisines,
  availableCities,
  businesses,
  onCountrySelect,
  onCuisineSelect,
  onCitySelect,
  onGetNow,
  onBusinessSelect,
  voicePreferences
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    currentTranscript: '',
    isWaitingForConfirmation: false,
    pendingSelection: '',
    pendingType: null,
    audioEnabled: voicePreferences?.audio_enabled ?? true,
    selectedBusinessIndex: 0,
    voiceEnabled: voicePreferences?.voice_enabled ?? false
  });

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const listeningDeadlineRef = useRef<number>(0);
  const LISTENING_WINDOW_MS = 20000; // Allow up to 20s response time for seniors

  // Initialize Speech APIs
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true; // keep session active longer
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = handleSpeechResult;
        recognitionRef.current.onerror = handleSpeechError;
        recognitionRef.current.onstart = () => {
          setVoiceState(prev => ({ ...prev, isListening: true, currentTranscript: '' }));
        };
        recognitionRef.current.onend = () => {
          setVoiceState(prev => ({ ...prev, isListening: false }));
          // If within listening window, auto-restart to give user more time
          const now = Date.now();
          if (
            voiceState.voiceEnabled &&
            recognitionRef.current &&
            now < listeningDeadlineRef.current &&
            !voiceState.isWaitingForConfirmation
          ) {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.warn('Auto-restart recognition failed:', e);
              }
            }, 300);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Speak text with senior-friendly settings and English accent woman voice
  const speak = (text: string, priority: boolean = false) => {
    if (!voiceState.audioEnabled || !speechSynthesisRef.current) return;

    if (priority) {
      speechSynthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Clear speaking rate
    utterance.pitch = 1.0; // Natural pitch for English accent
    utterance.volume = 0.9;
    
    // English accent woman voice preferences
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      (voice.lang.includes('en-GB') && voice.name.toLowerCase().includes('female')) ||
      voice.name.includes('Kate') || 
      voice.name.includes('Serena') ||
      voice.name.includes('Emma') ||
      voice.name.includes('Amy') ||
      (voice.lang.includes('en-GB')) ||
      (voice.lang.includes('en-AU') && voice.name.toLowerCase().includes('female'))
    ) || voices.find(voice => voice.lang.includes('en-US') && voice.name.toLowerCase().includes('female')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current.speak(utterance);
  };

  // Get current prompt based on step and state
  const getCurrentPrompt = (): string => {
    if (voiceState.isWaitingForConfirmation) {
      return `You selected ${voiceState.pendingSelection}. Is that correct? Say "yes" to confirm, "no" to try again, or "exit" to stop.`;
    }

    switch (currentStep) {
      case 1:
        return "Please select a country for your travel destination. You can also say 'what are my options' to hear the available countries.";
      case 2:
        return "Please select your preferred cuisine type. You can also say 'what are my options' to hear the available cuisines.";
      case 3:
        return "Please select your preferred city. You can also say 'what are my options' to hear the available cities.";
      case 4:
        return businesses.length > 0 
          ? "Here are your restaurant options. Say 'next', 'previous', 'select', 'more details', or 'exit'."
          : "Now I'll search for restaurants. Say 'search' when you're ready, or 'go back' to change your selections.";
      default:
        return "Voice navigation is ready. Click the microphone to begin.";
    }
  };

  // Handle speech recognition results
  const handleSpeechResult = (event: any) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('')
      .toLowerCase()
      .trim();

    setVoiceState(prev => ({ ...prev, currentTranscript: transcript }));

    if (event.results[event.results.length - 1].isFinal) {
      processVoiceCommand(transcript);
    }
  };

  // Handle speech recognition errors
  const handleSpeechError = (event: any) => {
    console.error('Speech recognition error:', event.error);
    setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: false }));
    
    if (event.error === 'no-speech') {
      speak("I didn't catch that. Please speak more clearly and try again.");
      // Auto-restart listening after a brief pause, within the allowed window
      setTimeout(() => {
        if (
          voiceState.voiceEnabled &&
          recognitionRef.current &&
          Date.now() < listeningDeadlineRef.current
        ) {
          recognitionRef.current.start();
        }
      }, 2000);
    } else if (event.error === 'audio-capture') {
      speak("I can't access your microphone. Please check your microphone settings.");
    } else if (event.error === 'not-allowed') {
      speak("Microphone access is not allowed. Please enable microphone permissions.");
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice navigation.",
        variant: "destructive"
      });
    } else {
      speak("Sorry, I had trouble understanding. Please try again.");
    }
  };

  // Process voice commands
  const processVoiceCommand = (transcript: string) => {
    setVoiceState(prev => ({ ...prev, isProcessing: true }));

    // Handle confirmation state
    if (voiceState.isWaitingForConfirmation) {
      handleConfirmation(transcript);
      return;
    }

    // Handle common commands
    if (transcript.includes('exit') || transcript.includes('stop') || transcript.includes('quit')) {
      speak("Voice navigation stopped. You can continue using the form normally.");
      resetVoiceState();
      return;
    }

    if (transcript.includes('go back') || transcript.includes('previous step')) {
      handleGoBack();
      return;
    }

    if (transcript.includes('repeat') || transcript.includes('say again')) {
      speak(getCurrentPrompt());
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
      return;
    }

    if (transcript.includes('help') || transcript.includes('what are my options')) {
      handleHelpRequest();
      return;
    }

    // Handle step-specific commands
    switch (currentStep) {
      case 1:
        handleCountrySelection(transcript);
        break;
      case 2:
        handleCuisineSelection(transcript);
        break;
      case 3:
        handleCitySelection(transcript);
        break;
      case 4:
        if (businesses.length > 0) {
          handleBusinessNavigation(transcript);
        } else {
          handleSearchCommand(transcript);
        }
        break;
    }
  };

  // Handle confirmation responses
  const handleConfirmation = (transcript: string) => {
    if (transcript.includes('yes') || transcript.includes('correct') || transcript.includes('confirm')) {
      const { pendingSelection, pendingType } = voiceState;
      
      switch (pendingType) {
        case 'country':
          onCountrySelect(pendingSelection);
          speak(`Great! You selected ${pendingSelection}. Now let's choose your cuisine type.`);
          break;
        case 'cuisine':
          onCuisineSelect(pendingSelection);
          speak(`Perfect! You selected ${pendingSelection}. Now let's choose your city.`);
          break;
        case 'city':
          onCitySelect(pendingSelection);
          speak(`Excellent! You selected ${pendingSelection}. Now I can search for restaurants.`);
          break;
      }
      
      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: false,
        pendingSelection: '',
        pendingType: null,
        isProcessing: false
      }));
    } else if (transcript.includes('no') || transcript.includes('wrong') || transcript.includes('try again')) {
      speak(`No problem. ${getCurrentPrompt()}`);
      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: false,
        pendingSelection: '',
        pendingType: null,
        isProcessing: false
      }));
    } else {
      speak("Please say 'yes' to confirm, 'no' to try again, or 'exit' to stop.");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Handle country selection
  const handleCountrySelection = (transcript: string) => {
    const foundCountry = availableCountries.find(country =>
      transcript.includes(country.toLowerCase()) ||
      country.toLowerCase().includes(transcript)
    );

    if (foundCountry) {
      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: true,
        pendingSelection: foundCountry,
        pendingType: 'country',
        isProcessing: false
      }));
      speak(`You selected ${foundCountry}. Is that correct?`);
    } else {
      speak("Sorry, that country is not available. Would you like to hear the available countries or try another country?");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Handle cuisine selection
  const handleCuisineSelection = (transcript: string) => {
    const foundCuisine = availableCuisines.find(cuisine =>
      transcript.includes(cuisine.toLowerCase().replace(' food', '')) ||
      cuisine.toLowerCase().includes(transcript)
    );

    if (foundCuisine) {
      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: true,
        pendingSelection: foundCuisine,
        pendingType: 'cuisine',
        isProcessing: false
      }));
      speak(`You selected ${foundCuisine}. Is that correct?`);
    } else {
      speak("Sorry, that cuisine type is not available. Would you like to hear the available cuisines or try another cuisine?");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Handle city selection
  const handleCitySelection = (transcript: string) => {
    const foundCity = availableCities.find(city =>
      transcript.includes(city.toLowerCase()) ||
      city.toLowerCase().includes(transcript)
    );

    if (foundCity) {
      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: true,
        pendingSelection: foundCity,
        pendingType: 'city',
        isProcessing: false
      }));
      speak(`You selected ${foundCity}. Is that correct?`);
    } else {
      speak("Sorry, that city is not available in the selected country. Would you like to hear the available cities or try another city?");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Handle business navigation
  const handleBusinessNavigation = (transcript: string) => {
    if (transcript.includes('next')) {
      const nextIndex = Math.min(voiceState.selectedBusinessIndex + 1, businesses.length - 1);
      setVoiceState(prev => ({ ...prev, selectedBusinessIndex: nextIndex, isProcessing: false }));
      readBusinessDetails(businesses[nextIndex]);
    } else if (transcript.includes('previous') || transcript.includes('back')) {
      const prevIndex = Math.max(voiceState.selectedBusinessIndex - 1, 0);
      setVoiceState(prev => ({ ...prev, selectedBusinessIndex: prevIndex, isProcessing: false }));
      readBusinessDetails(businesses[prevIndex]);
    } else if (transcript.includes('select') || transcript.includes('choose')) {
      const selectedBusiness = businesses[voiceState.selectedBusinessIndex];
      speak(`You selected ${selectedBusiness.name}. Great choice!`);
      onBusinessSelect?.(selectedBusiness);
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    } else if (transcript.includes('more details') || transcript.includes('tell me more')) {
      readDetailedBusinessInfo(businesses[voiceState.selectedBusinessIndex]);
    } else {
      speak("Say 'next' for the next option, 'previous' for the previous option, 'select' to choose this restaurant, or 'more details' for additional information.");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Handle search command
  const handleSearchCommand = (transcript: string) => {
    if (transcript.includes('search') || transcript.includes('find') || transcript.includes('get now')) {
      speak("Searching for restaurants now...");
      onGetNow();
    } else {
      speak("Say 'search' when you're ready to find restaurants, or 'go back' to change your selections.");
    }
    setVoiceState(prev => ({ ...prev, isProcessing: false }));
  };

  // Handle help requests
  const handleHelpRequest = () => {
    let helpText = '';
    
    switch (currentStep) {
      case 1:
        helpText = `Available countries are: ${availableCountries.slice(0, 5).join(', ')}, and more.`;
        break;
      case 2:
        helpText = `Available cuisines include: ${availableCuisines.slice(0, 5).join(', ')}, and more.`;
        break;
      case 3:
        helpText = `Available cities include: ${availableCities.slice(0, 5).join(', ')}, and more.`;
        break;
      case 4:
        helpText = businesses.length > 0 
          ? "Navigate through restaurants by saying 'next', 'previous', 'select', or 'more details'."
          : "Say 'search' to find restaurants with your current selections.";
        break;
    }
    
    speak(helpText);
    setVoiceState(prev => ({ ...prev, isProcessing: false }));
  };

  // Read business details
  const readBusinessDetails = (business: any) => {
    const details = `${business.name}, rated ${business.rating} stars with ${business.reviewCount} reviews. Located at ${business.address}.`;
    speak(details);
  };

  // Read detailed business information
  const readDetailedBusinessInfo = (business: any) => {
    const details = `${business.name} is rated ${business.rating} stars with ${business.reviewCount} reviews. 
    Located at ${business.address}. 
    Phone: ${business.phone}. 
    ${business.website ? 'Website available.' : ''} 
    ${business.menuLink ? 'Menu available online.' : ''}`;
    speak(details);
    setVoiceState(prev => ({ ...prev, isProcessing: false }));
  };

  // Handle go back command
  const handleGoBack = () => {
    switch (currentStep) {
      case 2:
        speak("Going back to country selection.");
        // onGoToStep(1); // You'd need to implement this
        break;
      case 3:
        speak("Going back to cuisine selection.");
        // onGoToStep(2);
        break;
      case 4:
        speak("Going back to city selection.");
        // onGoToStep(3);
        break;
      default:
        speak("You're already at the first step.");
    }
    setVoiceState(prev => ({ ...prev, isProcessing: false }));
  };

  // Reset voice state
  const resetVoiceState = () => {
    setVoiceState({
      isListening: false,
      isProcessing: false,
      currentTranscript: '',
      isWaitingForConfirmation: false,
      pendingSelection: '',
      pendingType: null,
      audioEnabled: true,
      selectedBusinessIndex: 0,
      voiceEnabled: false
    });
  };

  // Toggle voice navigation
  const toggleVoiceNavigation = () => {
    setVoiceState(prev => ({ 
      ...prev, 
      voiceEnabled: !prev.voiceEnabled,
      isListening: false,
      isProcessing: false,
      currentTranscript: '',
      isWaitingForConfirmation: false,
      pendingSelection: '',
      pendingType: null
    }));
    
    if (voiceState.voiceEnabled && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    // Check microphone permissions first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        speak(getCurrentPrompt(), true);
        
        // Extend listening window for seniors
        listeningDeadlineRef.current = Date.now() + LISTENING_WINDOW_MS;
        
        // Start listening after speech ends
        setTimeout(() => {
          if (recognitionRef.current && voiceState.voiceEnabled) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Failed to start speech recognition:', error);
              toast({
                title: "Voice Recognition Error",
                description: "Failed to start voice recognition. Please try again.",
                variant: "destructive"
              });
            }
          }
        }, 3000);
      })
      .catch((error) => {
        console.error('Microphone access denied:', error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice navigation.",
          variant: "destructive"
        });
      });
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    resetVoiceState();
  };

  // Toggle audio
  const toggleAudio = () => {
    setVoiceState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8 border-2 border-primary/20">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-primary">Voice Navigation for Seniors</h2>
            <p className="text-lg text-muted-foreground">
              Complete the form using your voice - just click the microphone and speak naturally
            </p>
          </div>

          {/* Voice Toggle */}
          <div className="flex flex-col items-center space-y-4 p-6 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Label htmlFor="voice-toggle" className="text-lg font-medium">
                Enable Voice Navigation
              </Label>
              <Switch
                id="voice-toggle"
                checked={voiceState.voiceEnabled}
                onCheckedChange={toggleVoiceNavigation}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Turn this on to use voice commands throughout the form. You can turn it off at any time.
            </p>
          </div>

          {/* Voice Controls - Only show when enabled */}
          {voiceState.voiceEnabled && (
            <div className="space-y-6">
              {/* Main Voice Button */}
              <div className="flex justify-center">
                <Button
                  onClick={voiceState.isListening ? stopListening : startListening}
                  size="lg"
                  className={`w-32 h-32 rounded-full text-2xl font-bold transition-all duration-300 ${
                    voiceState.isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  disabled={voiceState.isProcessing}
                >
                  {voiceState.isListening ? (
                    <MicOff className="w-12 h-12" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </Button>
              </div>

              {/* Status and Controls */}
              <div className="space-y-4">
                {/* Status Badges */}
                <div className="flex justify-center gap-4 flex-wrap">
                  {voiceState.isListening && (
                    <Badge variant="default" className="text-lg py-2 px-4 bg-green-500">
                      🎤 Listening...
                    </Badge>
                  )}
                  {voiceState.isProcessing && (
                    <Badge variant="default" className="text-lg py-2 px-4 bg-blue-500">
                      🔄 Processing...
                    </Badge>
                  )}
                  {voiceState.isWaitingForConfirmation && (
                    <Badge variant="default" className="text-lg py-2 px-4 bg-yellow-500">
                      ❓ Waiting for confirmation
                    </Badge>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button
                    onClick={toggleAudio}
                    variant="outline"
                    size="lg"
                    className="text-lg py-3 px-6"
                  >
                    {voiceState.audioEnabled ? (
                      <>
                        <Volume2 className="w-5 h-5 mr-2" />
                        Audio On
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-5 h-5 mr-2" />
                        Audio Off
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => speak(getCurrentPrompt())}
                    variant="outline"
                    size="lg"
                    className="text-lg py-3 px-6"
                    disabled={!voiceState.audioEnabled}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Repeat
                  </Button>

                  <Button
                    onClick={() => speak("You can say commands like: help, repeat, go back, exit, or specific options for each step.")}
                    variant="outline"
                    size="lg"
                    className="text-lg py-3 px-6"
                  >
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Help
                  </Button>
                </div>

                {/* Current Transcript */}
                {voiceState.currentTranscript && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-lg font-semibold">You said:</p>
                    <p className="text-xl text-primary">{voiceState.currentTranscript}</p>
                  </div>
                )}

                {/* Current Status */}
                <div className="bg-background border rounded-lg p-4">
                  <p className="text-lg font-semibold mb-2">Current Step: {currentStep} of 4</p>
                  <p className="text-base text-muted-foreground">{getCurrentPrompt()}</p>
                </div>

                {/* Progress Display */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className={`p-3 rounded-lg border ${selectedCountry ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                    <p className="font-semibold">Country</p>
                    <p className="text-sm">{selectedCountry || 'Not selected'}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${selectedCuisine ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                    <p className="font-semibold">Cuisine</p>
                    <p className="text-sm">{selectedCuisine || 'Not selected'}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${selectedCity ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                    <p className="font-semibold">City</p>
                    <p className="text-sm">{selectedCity || 'Not selected'}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${businesses.length > 0 ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                    <p className="font-semibold">Results</p>
                    <p className="text-sm">{businesses.length > 0 ? `${businesses.length} found` : 'Not searched'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};