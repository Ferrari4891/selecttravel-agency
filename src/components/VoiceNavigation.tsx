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
  showPanel: boolean;
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
    voiceEnabled: voicePreferences?.voice_enabled ?? false,
    showPanel: false
  });

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const listeningDeadlineRef = useRef<number>(0);
  const LISTENING_WINDOW_MS = 20000; // Allow up to 20s response time for seniors
  
  // De-duplication and speaking state refs
  const lastFinalTranscriptRef = useRef<string>('');
  const lastPendingKeyRef = useRef<string>('');
  const isSpeakingRef = useRef<boolean>(false);
  // Recognition control refs to avoid race conditions
  const recognitionActiveRef = useRef<boolean>(false);
  const recognitionStartPendingRef = useRef<boolean>(false);
  const recognitionRestartTimeoutRef = useRef<number | null>(null);
  // Suppress processing shortly after TTS to avoid echo
  const noProcessUntilRef = useRef<number>(0);
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
          recognitionActiveRef.current = true;
          recognitionStartPendingRef.current = false;
          setVoiceState(prev => ({ ...prev, isListening: true, currentTranscript: '' }));
        };
        recognitionRef.current.onend = () => {
          recognitionActiveRef.current = false;
          setVoiceState(prev => ({ ...prev, isListening: false }));
          // If within listening window, auto-restart to give user more time
          const now = Date.now();
          if (
            voiceState.voiceEnabled &&
            recognitionRef.current &&
            now < listeningDeadlineRef.current &&
            !voiceState.isWaitingForConfirmation &&
            !isSpeakingRef.current
          ) {
            if (recognitionRestartTimeoutRef.current) {
              clearTimeout(recognitionRestartTimeoutRef.current);
            }
            recognitionRestartTimeoutRef.current = window.setTimeout(() => {
              safeStartRecognition();
            }, 800);
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

    // Stop listening while speaking to prevent feedback
    if (recognitionRef.current && voiceState.isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionActiveRef.current = false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal speech speed
    utterance.pitch = 0.9; // Slightly lower pitch for mature, refined tone
    utterance.volume = 0.9;
    
    // Prioritize senior cultivated English woman voices
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      // First priority: British English female voices that sound mature
      (voice.lang.includes('en-GB') && (
        voice.name.includes('Emma') ||
        voice.name.includes('Amy') ||
        voice.name.includes('Kate') ||
        voice.name.includes('Serena') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Fiona') ||
        voice.name.toLowerCase().includes('female')
      ))
    ) || voices.find(voice => 
      // Second priority: Any British English voice
      voice.lang.includes('en-GB')
    ) || voices.find(voice => 
      // Third priority: Australian English female (similar accent)
      voice.lang.includes('en-AU') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      // Fallback: Any English female voice
      voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Ensure speech recognition starts only after TTS completely finishes
    utterance.onstart = () => {
      isSpeakingRef.current = true;
      // Suppress processing for a short window to avoid capturing TTS echo
      noProcessUntilRef.current = Date.now() + 1200;
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      // Wait a bit longer to ensure no audio feedback from TTS is captured
      setTimeout(() => {
        if (
          voiceState.voiceEnabled &&
          recognitionRef.current &&
          !voiceState.isListening &&
          !recognitionActiveRef.current
        ) {
          safeStartRecognition();
        }
      }, 1200);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  // Safe start for speech recognition to avoid InvalidStateError
  const safeStartRecognition = () => {
    if (!recognitionRef.current) return;
    if (recognitionActiveRef.current || recognitionStartPendingRef.current) return;
    try {
      recognitionStartPendingRef.current = true;
      recognitionRef.current.start();
    } catch (error) {
      console.warn('Safe start failed:', error);
      recognitionStartPendingRef.current = false;
    }
  };

  // Get current prompt based on step and state
  const getCurrentPrompt = (): string => {
    if (voiceState.isWaitingForConfirmation) {
      return `You selected ${voiceState.pendingSelection}. Is that correct? Say "yes" to confirm, "no" to try again, or "exit" to stop.`;
    }

    switch (currentStep) {
      case 1:
        return "Please select a country for your travel destination.";
      case 2:
        return "Please select your preferred cuisine type.";
      case 3:
        return "Please select your preferred city.";
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
    const now = Date.now();
    if (isSpeakingRef.current || now < noProcessUntilRef.current) {
      // Ignore any results while TTS is speaking or immediately after
      return;
    }

    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('')
      .toLowerCase()
      .trim();

    setVoiceState(prev => ({ ...prev, currentTranscript: transcript }));

    const isFinal = event.results[event.results.length - 1].isFinal;
    if (isFinal) {
      if (transcript === lastFinalTranscriptRef.current) {
        // Ignore duplicate final transcripts
        return;
      }
      lastFinalTranscriptRef.current = transcript;
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
          Date.now() < listeningDeadlineRef.current &&
          !isSpeakingRef.current
        ) {
          safeStartRecognition();
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

    // Ignore our own TTS prompts that might slip through
    if (transcript.includes('you selected') || transcript.includes('is that correct')) {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
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
    const lower = transcript.toLowerCase();

    // Remove echoes of our own TTS prompt so we only parse the user's response
    const cleaned = lower
      .replace(/you selected[^.?!]*/g, '')
      .replace(/is that correct[^.?!]*/g, '')
      .replace(/[^a-z\s]/g, ' ') // strip punctuation
      .replace(/\s+/g, ' ')
      .trim();

    // If nothing meaningful remains, ignore this result
    if (!cleaned) {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
      return;
    }

    // Positive/negative vocab
    const yesWords = ['yes','yeah','yep','correct','confirm','that is correct','that\'s right','right','sure','ok','okay'];
    const noWords = ['no','nope','wrong','try again','change','cancel'];

    if (yesWords.some(w => cleaned.includes(w))) {
      const { pendingSelection, pendingType } = voiceState;
      switch (pendingType) {
        case 'country':
          onCountrySelect(pendingSelection);
          speak(`Great! You selected ${pendingSelection}. Now let's choose your cuisine type.`, true);
          break;
        case 'cuisine':
          onCuisineSelect(pendingSelection);
          speak(`Perfect! You selected ${pendingSelection}. Now let's choose your city.`, true);
          break;
        case 'city':
          onCitySelect(pendingSelection);
          speak(`Excellent! You selected ${pendingSelection}. Now I can search for restaurants. Say 'search' when ready.`, true);
          break;
      }

      lastPendingKeyRef.current = '';
      lastFinalTranscriptRef.current = '';
      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: false,
        pendingSelection: '',
        pendingType: null,
        isProcessing: false
      }));
      
      // Continue listening for the next step after TTS finishes
      setTimeout(() => {
        if (voiceState.voiceEnabled && !isSpeakingRef.current) {
          listeningDeadlineRef.current = Date.now() + LISTENING_WINDOW_MS;
        }
      }, 2000);
    } else if (noWords.some(w => cleaned.includes(w))) {
      speak(`No problem. ${getCurrentPrompt()}`, true);
      lastPendingKeyRef.current = '';
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
    console.log('🎤 Country selection - transcript:', transcript);
    console.log('🎤 Available countries:', availableCountries);
    
    // Normalize transcript for better matching
    const normalizedTranscript = transcript.toLowerCase().trim().replace(/[.,!?]/g, '');
    
    // Country aliases for better matching
    const countryAliases: Record<string, string[]> = {
      'United States': ['usa', 'us', 'america', 'united states', 'states'],
      'United Kingdom': ['uk', 'britain', 'england', 'united kingdom', 'great britain'],
      'United Arab Emirates': ['uae', 'emirates', 'united arab emirates'],
      'South Korea': ['korea', 'south korea'],
      'New Zealand': ['new zealand', 'nz'],
      'South Africa': ['south africa'],
      'China': ['china', 'chinese'],
      'France': ['france', 'french'],
      'Germany': ['germany', 'german'],
      'Italy': ['italy', 'italian'],
      'Spain': ['spain', 'spanish'],
      'Japan': ['japan', 'japanese'],
      'Canada': ['canada', 'canadian'],
      'Mexico': ['mexico', 'mexican'],
      'Brazil': ['brazil', 'brazilian'],
      'India': ['india', 'indian'],
    };

    let foundCountry = null;
    
    // First, try exact country name match
    foundCountry = availableCountries.find(country =>
      normalizedTranscript === country.toLowerCase() ||
      normalizedTranscript.includes(country.toLowerCase())
    );

    // If no exact match, check aliases
    if (!foundCountry) {
      for (const [country, aliases] of Object.entries(countryAliases)) {
        if (availableCountries.includes(country)) {
          const aliasMatch = aliases.find(alias => 
            normalizedTranscript === alias || 
            normalizedTranscript.includes(alias)
          );
          if (aliasMatch) {
            foundCountry = country;
            console.log('🎤 Found country via alias:', country, 'for alias:', aliasMatch);
            break;
          }
        }
      }
    }

    console.log('🎤 Final matched country:', foundCountry);

    if (foundCountry) {
      const key = `country:${foundCountry}`;
      if (lastPendingKeyRef.current === key && voiceState.isWaitingForConfirmation) {
        setVoiceState(prev => ({ ...prev, isProcessing: false }));
        return; // prevent duplicate confirmation prompts
      }

      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: true,
        pendingSelection: foundCountry,
        pendingType: 'country',
        isProcessing: false
      }));
      lastPendingKeyRef.current = key;
      speak(`You selected ${foundCountry}. Is that correct?`, true);
    } else {
      speak("Sorry, I didn't recognize that country. Please try again or say 'help' to hear available options.", true);
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
      const key = `cuisine:${foundCuisine}`;
      if (lastPendingKeyRef.current === key && voiceState.isWaitingForConfirmation) {
        setVoiceState(prev => ({ ...prev, isProcessing: false }));
        return;
      }

      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: true,
        pendingSelection: foundCuisine,
        pendingType: 'cuisine',
        isProcessing: false
      }));
      lastPendingKeyRef.current = key;
      speak(`You selected ${foundCuisine}. Is that correct?`, true);
    } else {
      speak("Sorry, that cuisine type is not available. Would you like to hear the available cuisines or try another cuisine?", true);
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
      const key = `city:${foundCity}`;
      if (lastPendingKeyRef.current === key && voiceState.isWaitingForConfirmation) {
        setVoiceState(prev => ({ ...prev, isProcessing: false }));
        return;
      }

      setVoiceState(prev => ({
        ...prev,
        isWaitingForConfirmation: true,
        pendingSelection: foundCity,
        pendingType: 'city',
        isProcessing: false
      }));
      lastPendingKeyRef.current = key;
      speak(`You selected ${foundCity}. Is that correct?`, true);
    } else {
      speak("Sorry, that city is not available in the selected country. Would you like to hear the available cities or try another city?", true);
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
        break;
      case 3:
        speak("Going back to cuisine selection.");
        break;
      case 4:
        speak("Going back to city selection.");
        break;
      default:
        speak("Already at the first step.");
    }
    setVoiceState(prev => ({ ...prev, isProcessing: false }));
  };

  // Reset voice state
  const resetVoiceState = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    setVoiceState(prev => ({
      ...prev,
      isListening: false,
      isProcessing: false,
      currentTranscript: '',
      isWaitingForConfirmation: false,
      pendingSelection: '',
      pendingType: null,
      selectedBusinessIndex: 0,
      showPanel: false
    }));
  };

  // Start listening
  const startListening = () => {
    if (!voiceState.voiceEnabled) {
      toast({
        title: "Voice Not Enabled",
        description: "Please enable voice navigation in settings first.",
        variant: "destructive"
      });
      return;
    }

    // Check microphone permissions first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        // Clear previous dedupe guards
        lastFinalTranscriptRef.current = '';
        lastPendingKeyRef.current = '';
        speak(getCurrentPrompt(), true);
        
        // Extend listening window for seniors
        listeningDeadlineRef.current = Date.now() + LISTENING_WINDOW_MS;
        
        // Speech recognition will start automatically when TTS ends via utterance.onend
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

  // Toggle voice panel
  const togglePanel = () => {
    setVoiceState(prev => ({ ...prev, showPanel: !prev.showPanel }));
  };

  // If voice is not enabled, just show the button to open panel
  if (!voiceState.voiceEnabled) {
    return (
      <Button
        onClick={() => setVoiceState(prev => ({ ...prev, voiceEnabled: true, showPanel: true }))}
        className="bg-green-600 hover:bg-green-700 text-white font-medium w-full h-8 text-sm"
      >
        <Mic className="h-4 w-4 mr-2" />
        Select Voice
      </Button>
    );
  }

  return (
    <div className="relative">
      {/* Voice activation button */}
      {!voiceState.showPanel && (
        <Button
          onClick={togglePanel}
          className="bg-green-600 hover:bg-green-700 text-white font-medium w-full h-8 text-sm"
        >
          <Mic className="h-4 w-4 mr-2" />
          Select Voice
        </Button>
      )}

      {/* Voice Control Panel */}
      {voiceState.showPanel && (
        <Card className="w-80 border shadow-lg bg-background/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                <span className="font-medium">Voice Navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={voiceState.audioEnabled}
                  onCheckedChange={(checked) => setVoiceState(prev => ({ ...prev, audioEnabled: checked }))}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetVoiceState}
                  className="h-6 w-6 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoiceState(prev => ({ ...prev, showPanel: false }))}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Current status */}
            <div className="text-sm text-muted-foreground mb-3">
              Step {currentStep}: {getCurrentPrompt()}
            </div>

            {/* Status indicators */}
            {voiceState.isListening && (
              <Badge variant="default" className="bg-green-500 text-white mb-2 animate-pulse">
                🎤 Listening...
              </Badge>
            )}
            {voiceState.isProcessing && (
              <Badge variant="default" className="bg-blue-500 text-white mb-2">
                🔄 Processing...
              </Badge>
            )}
            {voiceState.isWaitingForConfirmation && (
              <Badge variant="default" className="bg-yellow-500 text-white mb-2">
                ❓ Confirm selection?
              </Badge>
            )}

            {/* Current transcript */}
            {voiceState.currentTranscript && (
              <div className="border rounded-lg p-2 mb-3 bg-muted/50">
                <p className="text-sm text-primary">{voiceState.currentTranscript}</p>
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-2">
              <Button
                onClick={voiceState.isListening ? stopListening : startListening}
                size="sm"
                className={`flex-1 ${
                  voiceState.isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                disabled={voiceState.isProcessing}
              >
                {voiceState.isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className="flex-1"
              >
                {voiceState.audioEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Audio Off
                  </>
                )}
              </Button>
            </div>

            {/* Help button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpRequest}
              className="w-full mt-2"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              What are my options?
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};