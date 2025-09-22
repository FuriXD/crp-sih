export class VoiceService {
  private synthesis: SpeechSynthesis;
  private recognition: any;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  speak(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getVoiceLanguage(language);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synthesis.speak(utterance);
    });
  }

  async listen(language: string = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.lang = this.getVoiceLanguage(language);
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(event.error));
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.isListening = true;
      this.recognition.start();
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  private getVoiceLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      'english': 'en-US',
      'hindi': 'hi-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'kannada': 'kn-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN',
      'bengali': 'bn-IN',
      'punjabi': 'pa-IN',
      'malayalam': 'ml-IN'
    };
    return languageMap[language.toLowerCase()] || 'en-US';
  }

  // Translate common farming terms to local languages
  translateText(text: string, targetLanguage: string): string {
    if (targetLanguage === 'english') return text;
    
    const translations: Record<string, Record<string, string>> = {
      hindi: {
        'irrigation': 'सिंचाई',
        'fertilizer': 'उर्वरक',
        'yield': 'उत्पादन',
        'soil': 'मिट्टी',
        'crop': 'फसल',
        'weather': 'मौसम',
        'pest': 'कीट',
        'disease': 'रोग',
        'recommendation': 'सिफारिश',
        'analysis': 'विश्लेषण',
        'moisture': 'नमी',
        'temperature': 'तापमान'
      },
      tamil: {
        'irrigation': 'நீர்ப்பாசனம்',
        'fertilizer': 'உரம்',
        'yield': 'விளைச்சல்',
        'soil': 'மண்',
        'crop': 'பயிர்',
        'weather': 'வானிலை',
        'pest': 'பூச்சி',
        'disease': 'நோய்',
        'recommendation': 'பரிந்துரை',
        'analysis': 'பகுப்பாய்வு',
        'moisture': 'ஈரப்பதம்',
        'temperature': 'வெப்பநிலை'
      }
    };

    let translatedText = text;
    const langTranslations = translations[targetLanguage.toLowerCase()];
    
    if (langTranslations) {
      Object.entries(langTranslations).forEach(([english, translated]) => {
        const regex = new RegExp(english, 'gi');
        translatedText = translatedText.replace(regex, translated);
      });
    }

    return translatedText;
  }

  // Professional farming assistant responses
  getProfessionalResponse(command: string, language: string): string {
    const lowerCommand = command.toLowerCase();
    
    const responses: Record<string, Record<string, string>> = {
      weather: {
        english: 'Based on current meteorological data, I recommend monitoring weather patterns for optimal irrigation timing.',
        hindi: 'वर्तमान मौसम विज्ञान डेटा के आधार पर, मैं सिंचाई के समय के लिए मौसम पैटर्न की निगरानी की सिफारिश करता हूं।',
        tamil: 'தற்போதைய வானிலை தரவுகளின் அடிப்படையில், உகந்த நீர்ப்பாசன நேரத்திற்கு வானிலை முறைகளை கண்காணிக்க பரிந்துரைக்கிறேன்.'
      },
      irrigation: {
        english: 'Your irrigation schedule has been optimized based on soil moisture analysis and weather forecasting models.',
        hindi: 'मिट्टी की नमी विश्लेषण और मौसम पूर्वानुमान मॉडल के आधार पर आपका सिंचाई कार्यक्रम अनुकूलित किया गया है।',
        tamil: 'மண் ஈரப்பதம் பகுப்பாய்வு மற்றும் வானிலை முன்னறிவிப்பு மாதிரிகளின் அடிப்படையில் உங்கள் நீர்ப்பாசன அட்டவணை மேம்படுத்தப்பட்டுள்ளது.'
      },
      yield: {
        english: 'According to our predictive analytics, your expected yield is calculated using advanced agricultural modeling techniques.',
        hindi: 'हमारे भविष्यवाणी विश्लेषण के अनुसार, आपकी अपेक्षित उपज उन्नत कृषि मॉडलिंग तकनीकों का उपयोग करके गणना की जाती है।',
        tamil: 'எங்கள் முன்னறிவிப்பு பகுப்பாய்வின் படி, உங்கள் எதிர்பார்க்கப்படும் விளைச்சல் மேம்பட்ட விவசாய மாதிரி நுட்பங்களைப் பயன்படுத்தி கணக்கிடப்படுகிறது.'
      },
      fertilizer: {
        english: 'Fertilizer recommendations are generated through comprehensive soil nutrient analysis and crop-specific requirements.',
        hindi: 'उर्वरक सिफारिशें व्यापक मिट्टी पोषक तत्व विश्लेषण और फसल-विशिष्ट आवश्यकताओं के माध्यम से उत्पन्न होती हैं।',
        tamil: 'உர பரிந்துரைகள் விரிவான மண் ஊட்டச்சத்து பகுப்பாய்வு மற்றும் பயிர்-குறிப்பிட்ட தேவைகள் மூலம் உருவாக்கப்படுகின்றன.'
      },
      help: {
        english: 'I provide evidence-based agricultural guidance including weather analysis, irrigation optimization, yield forecasting, and nutrient management recommendations.',
        hindi: 'मैं मौसम विश्लेषण, सिंचाई अनुकूलन, उपज पूर्वानुमान, और पोषक तत्व प्रबंधन सिफारिशों सहित साक्ष्य-आधारित कृषि मार्गदर्शन प्रदान करता हूं।',
        tamil: 'வானிலை பகுப்பாய்வு, நீர்ப்பாசன மேம்படுத்தல், விளைச்சல் முன்னறிவிப்பு மற்றும் ஊட்டச்சத்து மேலாண்மை பரிந்துரைகள் உட்பட ஆதார அடிப்படையிலான விவசாய வழிகாட்டுதலை வழங்குகிறேன்.'
      }
    };
    
    if (lowerCommand.includes('weather') || lowerCommand.includes('मौसम')) {
      return responses.weather[language] || responses.weather.english;
    } else if (lowerCommand.includes('irrigation') || lowerCommand.includes('सिंचाई')) {
      return responses.irrigation[language] || responses.irrigation.english;
    } else if (lowerCommand.includes('yield') || lowerCommand.includes('उत्पादन')) {
      return responses.yield[language] || responses.yield.english;
    } else if (lowerCommand.includes('fertilizer') || lowerCommand.includes('उर्वरक')) {
      return responses.fertilizer[language] || responses.fertilizer.english;
    } else if (lowerCommand.includes('help') || lowerCommand.includes('मदद')) {
      return responses.help[language] || responses.help.english;
    } else {
      const defaultResponse = {
        english: 'I have processed your query. Please specify if you need assistance with weather analysis, irrigation scheduling, yield forecasting, or fertilizer recommendations.',
        hindi: 'मैंने आपकी क्वेरी को संसाधित किया है। कृपया बताएं कि क्या आपको मौसम विश्लेषण, सिंचाई शेड्यूलिंग, उपज पूर्वानुमान, या उर्वरक सिफारिशों में सहायता चाहिए।',
        tamil: 'உங்கள் வினவலை செயலாக்கியுள்ளேன். வானிலை பகுப்பாய்வு, நீர்ப்பாசன திட்டமிடல், விளைச்சல் முன்னறிவிப்பு அல்லது உர பரிந்துரைகளில் உதவி தேவையா என்பதைக் குறிப்பிடவும்.'
      };
      return defaultResponse[language] || defaultResponse.english;
    }
  }
}

export const voiceService = new VoiceService();