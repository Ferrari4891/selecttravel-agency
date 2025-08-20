import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceInteractionProps {
  onSearchComplete: (city: string, activity: string, resultCount: number) => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ onSearchComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    city: '',
    activity: '',
    resultCount: 0
  });
  
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const steps = [
    "What city do you want?",
    "What do you want to do there? Eat, stay, drink or shop?",
    "How many results do you want between 1 and 50?",
    "Say 'Get now' to search"
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
    }
  }, []);

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onend = () => {
        setTimeout(() => startListening(), 500);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      handleSpeechResult(transcript);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      toast({
        title: "Error",
        description: "Speech recognition error. Please try again.",
        variant: "destructive"
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const handleSpeechResult = (transcript: string) => {
    setIsListening(false);
    
    switch (currentStep) {
      case 0: // City
        setResponses(prev => ({ ...prev, city: transcript }));
        setCurrentStep(1);
        setTimeout(() => speak(steps[1]), 1000);
        break;
        
      case 1: // Activity
        const validActivities = ['eat', 'stay', 'drink', 'shop'];
        const activity = validActivities.find(act => transcript.includes(act));
        if (activity) {
          setResponses(prev => ({ ...prev, activity }));
          setCurrentStep(2);
          setTimeout(() => speak(steps[2]), 1000);
        } else {
          speak("Please say eat, stay, drink, or shop");
        }
        break;
        
      case 2: // Result count
        const numberMatch = transcript.match(/\d+/);
        if (numberMatch) {
          const num = parseInt(numberMatch[0]);
          if (num >= 1 && num <= 50) {
            setResponses(prev => ({ ...prev, resultCount: num }));
            setCurrentStep(3);
            setTimeout(() => speak(steps[3]), 1000);
          } else {
            speak("Please say a number between 1 and 50");
          }
        } else {
          speak("Please say a number between 1 and 50");
        }
        break;
        
      case 3: // Final command
        if (transcript.includes('get now')) {
          onSearchComplete(responses.city, responses.activity, responses.resultCount);
          resetInteraction();
          toast({
            title: "Search Started",
            description: `Searching for ${responses.activity} in ${responses.city}`,
          });
        } else {
          speak("Say 'Get now' to start your search");
        }
        break;
    }
  };

  const startVoiceInteraction = () => {
    if (!isActive) {
      setIsActive(true);
      setCurrentStep(0);
      setResponses({ city: '', activity: '', resultCount: 0 });
      speak(steps[0]);
    }
  };

  const resetInteraction = () => {
    setIsActive(false);
    setIsListening(false);
    setCurrentStep(0);
    setResponses({ city: '', activity: '', resultCount: 0 });
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  if (!isActive) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={startVoiceInteraction}
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Voice Search</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of 4
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-center">
            <p className="font-medium">{steps[currentStep]}</p>
          </div>
          
          {responses.city && (
            <div className="text-sm">
              <span className="font-medium">City:</span> {responses.city}
            </div>
          )}
          
          {responses.activity && (
            <div className="text-sm">
              <span className="font-medium">Activity:</span> {responses.activity}
            </div>
          )}
          
          {responses.resultCount > 0 && (
            <div className="text-sm">
              <span className="font-medium">Results:</span> {responses.resultCount}
            </div>
          )}
        </div>

        <div className="flex justify-center mb-4">
          {isListening ? (
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <MicOff className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <Mic className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={resetInteraction}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          {currentStep < 3 && (
            <Button
              onClick={startListening}
              disabled={isListening}
              className="flex-1"
            >
              {isListening ? 'Listening...' : 'Repeat'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInteraction;