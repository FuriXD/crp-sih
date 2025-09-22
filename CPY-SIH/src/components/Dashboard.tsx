import React, { useState, useEffect } from 'react';
import { 
  Cloud, Droplets, Thermometer, Wind, Calendar, 
  TrendingUp, AlertCircle, CheckCircle, Clock,
  Sprout, Zap, Users, BarChart3, MessageCircle
} from 'lucide-react';
import { Farmer, AIPrediction, WeatherForecast } from '../types/farmer';
import { VoiceAssistant } from './VoiceAssistant';
import { ChatGroup } from './ChatGroup';
import { weatherService } from '../services/weatherService';

interface DashboardProps {
  farmer: Farmer;
  prediction: AIPrediction | null;
  onDataInput: () => void;
}

export function Dashboard({ farmer, prediction, onDataInput }: DashboardProps) {
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    loadWeatherData();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadWeatherData = async () => {
    try {
      const forecast = await weatherService.getForecast(
        farmer.location.latitude,
        farmer.location.longitude
      );
      setWeather(forecast);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const getNextAction = (): { action: string; priority: 'high' | 'medium' | 'low'; icon: React.ReactNode } => {
    if (!prediction) {
      return {
        action: 'Complete soil and crop data input to get recommendations',
        priority: 'high',
        icon: <AlertCircle size={20} />
      };
    }

    const actions = [];
    
    if (prediction.irrigationSchedule.nextIrrigation === 'Today') {
      actions.push({
        action: `Irrigate with ${prediction.irrigationSchedule.amount}mm water`,
        priority: 'high' as const,
        icon: <Droplets size={20} />
      });
    }
    
    if (prediction.pestDiseaseRisk.risk === 'high') {
      actions.push({
        action: 'Inspect crops for pest/disease signs',
        priority: 'high' as const,
        icon: <AlertCircle size={20} />
      });
    }
    
    if (actions.length === 0) {
      actions.push({
        action: 'Monitor crop growth and weather conditions',
        priority: 'low' as const,
        icon: <CheckCircle size={20} />
      });
    }
    
    return actions[0];
  };

  const nextAction = getNextAction();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {farmer.name}
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              <Sprout className="mr-2" size={16} />
              {farmer.cropDetails[0]?.cropType} • {farmer.location.district}, {farmer.location.state}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            
            <button
              onClick={onDataInput}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Update Data
            </button>
            
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <MessageCircle className="mr-2" size={16} />
              Community Chat
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Next Action CTA */}
        <div className={`mb-6 p-4 rounded-xl border-l-4 ${
          nextAction.priority === 'high' ? 'bg-red-50 border-red-500' :
          nextAction.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
          'bg-green-50 border-green-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                nextAction.priority === 'high' ? 'bg-red-100 text-red-600' :
                nextAction.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {nextAction.icon}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Next Action</h3>
                <p className="text-gray-700">{nextAction.action}</p>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Take Action
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Yield Forecast */}
            {prediction && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="mr-3 text-green-500" size={24} />
                    Yield Forecast
                  </h2>
                  <div className="text-sm text-gray-500">
                    {Math.round(prediction.yieldForecast.confidence * 100)}% confidence
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {prediction.yieldForecast.estimated} {prediction.yieldForecast.unit}
                    </div>
                    <div className="text-sm text-green-700 mt-1">Expected Yield</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Factors:</h4>
                    {prediction.yieldForecast.reasoning.slice(0, 2).map((reason, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="mr-2 mt-0.5 text-green-500 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-600">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {prediction && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="mr-3 text-blue-500" size={24} />
                  AI Recommendations
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Irrigation */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Droplets className="mr-2 text-blue-500" size={20} />
                      <h3 className="font-medium">Irrigation</h3>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {prediction.irrigationSchedule.nextIrrigation}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {prediction.irrigationSchedule.amount}mm water
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(prediction.irrigationSchedule.confidence * 100)}% confidence
                    </div>
                  </div>
                  
                  {/* Fertilizer */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Sprout className="mr-2 text-green-500" size={20} />
                      <h3 className="font-medium">Fertilizer</h3>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {prediction.fertilizerRecommendation.type}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {prediction.fertilizerRecommendation.quantity}kg/ha
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(prediction.fertilizerRecommendation.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
                
                {/* Pest Risk */}
                {prediction.pestDiseaseRisk.risk !== 'low' && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    prediction.pestDiseaseRisk.risk === 'high' ? 'bg-red-50 border border-red-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <AlertCircle className={`mr-2 ${
                        prediction.pestDiseaseRisk.risk === 'high' ? 'text-red-500' : 'text-yellow-500'
                      }`} size={20} />
                      <h3 className="font-medium">
                        {prediction.pestDiseaseRisk.risk === 'high' ? 'High' : 'Medium'} Pest Risk
                      </h3>
                    </div>
                    <div className="text-sm text-gray-700">
                      Threats: {prediction.pestDiseaseRisk.threats.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Community Insights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-3 text-purple-500" size={24} />
                Community Insights
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Droplets className="mr-3 text-blue-500" size={16} />
                    <span className="text-sm font-medium">12 nearby farmers irrigated today</span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="mr-3 text-yellow-500" size={16} />
                    <span className="text-sm font-medium">Aphid outbreak reported in 5km radius</span>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="mr-3 text-green-500" size={16} />
                    <span className="text-sm font-medium">Average yield in area: 15% above normal</span>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Weather & Status */}
          <div className="space-y-6">
            {/* Weather Forecast */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Cloud className="mr-3 text-blue-500" size={24} />
                Weather Forecast
              </h2>
              
              {weather.length > 0 && (
                <div className="space-y-3">
                  {weather.slice(0, 5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {weatherService.getWeatherIcon(day.condition)}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-sm text-gray-600">{day.condition}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {Math.round(day.temperature.max)}°/{Math.round(day.temperature.min)}°
                        </div>
                        {day.rainfall > 0 && (
                          <div className="text-sm text-blue-600">
                            {Math.round(day.rainfall)}mm
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {weather.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-1">Irrigation Advice</div>
                  <div className="text-sm text-blue-700">
                    {weatherService.getIrrigationAdvice(weather)}
                  </div>
                </div>
              )}
            </div>

            {/* Farm Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="mr-3 text-green-500" size={24} />
                Farm Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Crop Stage</span>
                    <span className="text-sm text-gray-600 capitalize">
                      {farmer.cropDetails[0]?.growthStage}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Data Completeness</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    Land Size: {farmer.landSize} ha
                  </div>
                  <div className="text-sm text-gray-600">
                    Crop Area: {farmer.cropDetails[0]?.areaAllocated} ha
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">Last sync</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {isOnline ? 'Just now' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoiceAssistant
        language={farmer.preferredLanguage}
        onCommand={(command) => console.log('Voice command:', command)}
      />
      
      <ChatGroup
        farmer={farmer}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}