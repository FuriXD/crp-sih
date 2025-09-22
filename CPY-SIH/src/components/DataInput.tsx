import React, { useState } from 'react';
import { 
  TestTube, Thermometer, Droplets, Zap, 
  Sprout, Calendar, Save, ArrowLeft 
} from 'lucide-react';
import { SoilData, SensorData, Farmer } from '../types/farmer';
import { storageService } from '../services/storage';
import { aiEngine } from '../services/aiEngine';

interface DataInputProps {
  farmer: Farmer;
  onDataSubmitted: (prediction: any) => void;
  onBack: () => void;
}

export function DataInput({ farmer, onDataSubmitted, onBack }: DataInputProps) {
  const [activeTab, setActiveTab] = useState<'soil' | 'sensor'>('soil');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [soilData, setSoilData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    moisture: '',
    temperature: ''
  });

  const [sensorData, setSensorData] = useState({
    soilMoisture: '',
    ndvi: '',
    temperature: '',
    humidity: ''
  });

  const handleSoilDataChange = (field: string, value: string) => {
    setSoilData(prev => ({ ...prev, [field]: value }));
  };

  const handleSensorDataChange = (field: string, value: string) => {
    setSensorData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create soil data record
      const soilRecord: SoilData = {
        id: `soil_${Date.now()}`,
        farmerId: farmer.id,
        ph: parseFloat(soilData.ph) || 7.0,
        nitrogen: parseFloat(soilData.nitrogen) || 25,
        phosphorus: parseFloat(soilData.phosphorus) || 15,
        potassium: parseFloat(soilData.potassium) || 120,
        organicMatter: parseFloat(soilData.organicMatter) || 2.5,
        moisture: parseFloat(soilData.moisture) || 45,
        temperature: parseFloat(soilData.temperature) || 25,
        recordedDate: new Date().toISOString()
      };

      // Create sensor data record if provided
      let sensorRecord: SensorData | undefined;
      if (sensorData.soilMoisture || sensorData.ndvi) {
        sensorRecord = {
          id: `sensor_${Date.now()}`,
          farmerId: farmer.id,
          soilMoisture: parseFloat(sensorData.soilMoisture) || soilRecord.moisture,
          ndvi: parseFloat(sensorData.ndvi) || 0.6,
          temperature: parseFloat(sensorData.temperature) || soilRecord.temperature,
          humidity: parseFloat(sensorData.humidity) || 65,
          timestamp: new Date().toISOString()
        };
      }

      // Store data locally
      await storageService.store('soilData', soilRecord);
      if (sensorRecord) {
        await storageService.store('sensorData', sensorRecord);
      }

      // Generate AI prediction
      const prediction = await aiEngine.generatePrediction(
        farmer.id,
        farmer.cropDetails,
        soilRecord,
        sensorRecord
      );

      // Store prediction
      await storageService.store('predictions', prediction);
      await storageService.setSyncStatus(prediction.id, false);

      onDataSubmitted(prediction);
    } catch (error) {
      console.error('Failed to process data:', error);
      alert('Failed to process data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const hasSoilData = soilData.ph && soilData.nitrogen && soilData.moisture;
    return hasSoilData;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farm Data Input</h1>
            <p className="text-gray-600">Provide soil and sensor data to get AI predictions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('soil')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'soil'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TestTube className="inline mr-2" size={16} />
                Soil Analysis
              </button>
              <button
                onClick={() => setActiveTab('sensor')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'sensor'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Zap className="inline mr-2" size={16} />
                Sensor Data
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'soil' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* pH Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil pH Level *
                    </label>
                    <div className="relative">
                      <TestTube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={soilData.ph}
                        onChange={(e) => handleSoilDataChange('ph', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="6.5"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Optimal range: 6.0 - 7.5</div>
                  </div>

                  {/* Soil Moisture */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil Moisture (%) *
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={soilData.moisture}
                        onChange={(e) => handleSoilDataChange('moisture', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="45"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Good range: 40-60%</div>
                  </div>

                  {/* Soil Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil Temperature (°C)
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        value={soilData.temperature}
                        onChange={(e) => handleSoilDataChange('temperature', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="25"
                      />
                    </div>
                  </div>

                  {/* Organic Matter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organic Matter (%)
                    </label>
                    <div className="relative">
                      <Sprout className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        step="0.1"
                        value={soilData.organicMatter}
                        onChange={(e) => handleSoilDataChange('organicMatter', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="2.5"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Good range: 3-5%</div>
                  </div>
                </div>

                {/* Nutrient Analysis */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nutrient Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nitrogen (ppm) *
                      </label>
                      <input
                        type="number"
                        value={soilData.nitrogen}
                        onChange={(e) => handleSoilDataChange('nitrogen', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="25"
                      />
                      <div className="text-xs text-gray-500 mt-1">Good: &gt;30 ppm</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phosphorus (ppm)
                      </label>
                      <input
                        type="number"
                        value={soilData.phosphorus}
                        onChange={(e) => handleSoilDataChange('phosphorus', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="15"
                      />
                      <div className="text-xs text-gray-500 mt-1">Good: &gt;20 ppm</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Potassium (ppm)
                      </label>
                      <input
                        type="number"
                        value={soilData.potassium}
                        onChange={(e) => handleSoilDataChange('potassium', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="120"
                      />
                      <div className="text-xs text-gray-500 mt-1">Good: &gt;150 ppm</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Optional Sensor Data</h3>
                  <p className="text-blue-700 text-sm">
                    Sensor data helps improve prediction accuracy. Skip this section if you don't have sensors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil Moisture Sensor (%)
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sensorData.soilMoisture}
                        onChange={(e) => handleSensorDataChange('soilMoisture', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Real-time moisture reading"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NDVI (Vegetation Index)
                    </label>
                    <div className="relative">
                      <Sprout className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={sensorData.ndvi}
                        onChange={(e) => handleSensorDataChange('ndvi', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.6"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Range: 0.0 - 1.0</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Air Temperature (°C)
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        value={sensorData.temperature}
                        onChange={(e) => handleSensorDataChange('temperature', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="28"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={sensorData.humidity}
                      onChange={(e) => handleSensorDataChange('humidity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                * Required fields for AI prediction
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating Predictions...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Generate AI Predictions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}