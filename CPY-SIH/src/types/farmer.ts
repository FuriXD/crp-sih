export interface Farmer {
  id: string;
  name: string;
  contact: string;
  email?: string;
  cropDetails: CropDetail[];
  landSize: number;
  preferredLanguage: string;
  location: {
    latitude: number;
    longitude: number;
    district: string;
    state: string;
  };
  registrationDate: string;
}

export interface CropDetail {
  id: string;
  cropType: string;
  variety: string;
  areaAllocated: number;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
}

export interface SoilData {
  id: string;
  farmerId: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
  temperature: number;
  recordedDate: string;
}

export interface SensorData {
  id: string;
  farmerId: string;
  soilMoisture: number;
  ndvi: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface AIPrediction {
  id: string;
  farmerId: string;
  cropId: string;
  yieldForecast: {
    estimated: number;
    confidence: number;
    unit: string;
    reasoning: string[];
  };
  irrigationSchedule: {
    nextIrrigation: string;
    amount: number;
    frequency: string;
    reasoning: string[];
    confidence: number;
  };
  fertilizerRecommendation: {
    type: string;
    quantity: number;
    timing: string;
    reasoning: string[];
    confidence: number;
  };
  pestDiseaseRisk: {
    risk: 'low' | 'medium' | 'high';
    threats: string[];
    preventiveMeasures: string[];
    confidence: number;
  };
  generatedDate: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  rainfall: number;
  condition: string;
  windSpeed: number;
}

export interface CommunityInsight {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'pest' | 'harvest';
  message: string;
  affectedFarmers: number;
  severity: 'info' | 'warning' | 'alert';
  date: string;
  location: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  location?: string;
  cropType?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  location: string;
  memberCount: number;
  messages: ChatMessage[];
  lastActivity: string;
}