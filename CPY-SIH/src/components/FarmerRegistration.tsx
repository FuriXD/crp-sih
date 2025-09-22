import React, { useState } from 'react';
import { User, MapPin, Crop, Globe, Phone, Mail } from 'lucide-react';
import { Farmer } from '../types/farmer';
import { storageService } from '../services/storage';

interface FarmerRegistrationProps {
  onRegistrationComplete: (farmer: Farmer) => void;
}

export function FarmerRegistration({ onRegistrationComplete }: FarmerRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    landSize: '',
    preferredLanguage: 'english',
    district: '',
    state: '',
    cropType: '',
    variety: '',
    areaAllocated: '',
    plantingDate: '',
    growthStage: 'seedling'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = [
    { code: 'english', name: 'English', native: 'English' },
    { code: 'hindi', name: 'Hindi', native: 'हिंदी' },
    { code: 'tamil', name: 'Tamil', native: 'தமிழ்' },
    { code: 'telugu', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'marathi', name: 'Marathi', native: 'मराठी' },
    { code: 'gujarati', name: 'Gujarati', native: 'ગુજરાતી' }
  ];

  const cropTypes = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
    'Potato', 'Tomato', 'Onion', 'Soybean', 'Groundnut'
  ];

  const growthStages = [
    'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturing'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const farmer: Farmer = {
        id: `farmer_${Date.now()}`,
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        landSize: parseFloat(formData.landSize),
        preferredLanguage: formData.preferredLanguage,
        location: {
          latitude: 0, // Would be obtained via geolocation
          longitude: 0,
          district: formData.district,
          state: formData.state
        },
        cropDetails: [{
          id: `crop_${Date.now()}`,
          cropType: formData.cropType,
          variety: formData.variety,
          areaAllocated: parseFloat(formData.areaAllocated),
          plantingDate: formData.plantingDate,
          expectedHarvestDate: '', // Calculated based on crop type
          growthStage: formData.growthStage
        }],
        registrationDate: new Date().toISOString()
      };

      // Store in offline storage
      await storageService.store('farmers', farmer);
      await storageService.setSyncStatus(farmer.id, false);

      onRegistrationComplete(farmer);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4">
            <Crop size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CropAI Platform</h1>
          <p className="text-gray-600">Register to get personalized farming insights and recommendations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">Farmer Registration</h2>
            <p className="text-green-100 mt-1">Complete your profile to unlock AI-powered farming insights</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="mr-2" size={20} />
                  Personal Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      required
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.native})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Farm Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Farm Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="District"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Land Size (hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.landSize}
                    onChange={(e) => setFormData({...formData, landSize: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="e.g., 2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Crop *
                  </label>
                  <select
                    required
                    value={formData.cropType}
                    onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">Select crop type</option>
                    {cropTypes.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variety
                    </label>
                    <input
                      type="text"
                      value={formData.variety}
                      onChange={(e) => setFormData({...formData, variety: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Crop variety"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (hectares) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.areaAllocated}
                      onChange={(e) => setFormData({...formData, areaAllocated: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="e.g., 1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planting Date
                    </label>
                    <input
                      type="date"
                      value={formData.plantingDate}
                      onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Growth Stage *
                    </label>
                    <select
                      required
                      value={formData.growthStage}
                      onChange={(e) => setFormData({...formData, growthStage: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      {growthStages.map(stage => (
                        <option key={stage} value={stage.toLowerCase()}>{stage}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}