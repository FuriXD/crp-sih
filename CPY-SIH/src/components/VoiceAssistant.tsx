import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface VoiceAssistantProps {
  language: string;
  onCommand?: (command: string) => void;
}

export function VoiceAssistant({ language, onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  useEffect(() => {
    // Announce availability when component mounts
    announceReady();
  }, [language]);

  const announceReady = async () => {
    const message = getLocalizedMessage('assistant_ready');
    await speak(message);
  };

  const speak = async (text: string) => {
    setIsSpeaking(true);
    try {
      const translatedText = voiceService.translateText(text, language);
      await voiceService.speak(translatedText, language);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const listen = async () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    try {
      const command = await voiceService.listen(language);
      setLastCommand(command);
      processVoiceCommand(command);
      onCommand?.(command);
    } catch (error) {
      console.error('Voice recognition error:', error);
      if (error === 'not-allowed' || (error as any)?.message === 'not-allowed') {
        await speak('Microphone access is required for voice commands. Please enable microphone permissions in your browser settings and try again.');
      } else {
        await speak('Sorry, I could not understand. Please try again.');
      }
    } finally {
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (command: string) => {
    const response = voiceService.getProfessionalResponse(command, language);
    await speak(response);
  };

  const getLocalizedMessage = (key: string): string => {
    const messages: Record<string, Record<string, string>> = {
      assistant_ready: {
        english: 'Professional agricultural assistant activated. I am ready to provide evidence-based farming guidance and recommendations.',
        hindi: 'पेशेवर कृषि सहायक सक्रिय। मैं साक्ष्य-आधारित कृषि मार्गदर्शन और सिफारिशें प्रदान करने के लिए तैयार हूं।',
        tamil: 'தொழில்முறை விவசாய உதவியாளர் செயல்படுத்தப்பட்டது. ஆதார அடிப்படையிலான விவசாய வழிகாட்டுதல் மற்றும் பரிந்துரைகளை வழங்க நான் தயாராக உள்ளேன்।'
      }
    };
    
    return messages[key]?.[language] || messages[key]?.english || '';
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-full shadow-lg p-4 border border-green-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={listen}
            disabled={isSpeaking}
            className={`p-3 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-green-500 text-white hover:bg-green-600'
            } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice command'}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            onClick={toggleSpeaking}
            className={`p-2 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Speaker status'}
          >
            {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
        
        {(isListening || lastCommand) && (
          <div className="mt-3 text-xs text-gray-600 max-w-56">
            {isListening ? (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Processing audio input...
              </div>
            ) : lastCommand ? (
              <div>
                Query: "{lastCommand.substring(0, 35)}..."
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}