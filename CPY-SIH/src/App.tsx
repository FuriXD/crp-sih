import React, { useState, useEffect } from 'react';
import { Farmer, AIPrediction } from './types/farmer';
import { FarmerRegistration } from './components/FarmerRegistration';
import { Dashboard } from './components/Dashboard';
import { DataInput } from './components/DataInput';
import { storageService } from './services/storage';

function App() {
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<AIPrediction | null>(null);
  const [currentView, setCurrentView] = useState<'registration' | 'dashboard' | 'dataInput'>('registration');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await storageService.init();
      
      // Check if there's an existing farmer
      const farmers = await storageService.getAll('farmers');
      if (farmers.length > 0) {
        const farmer = farmers[0]; // Use first farmer for demo
        setCurrentFarmer(farmer);
        
        // Load latest prediction
        const predictions = await storageService.getByIndex('predictions', 'farmerId', farmer.id);
        if (predictions.length > 0) {
          const latestPrediction = predictions.sort(
            (a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
          )[0];
          setCurrentPrediction(latestPrediction);
        }
        
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationComplete = (farmer: Farmer) => {
    setCurrentFarmer(farmer);
    setCurrentView('dataInput');
  };

  const handleDataSubmitted = (prediction: AIPrediction) => {
    setCurrentPrediction(prediction);
    setCurrentView('dashboard');
  };

  const handleDataInput = () => {
    setCurrentView('dataInput');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading CropAI Platform...</div>
          <div className="text-sm text-gray-500 mt-2">Initializing offline storage</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'registration' && (
        <FarmerRegistration onRegistrationComplete={handleRegistrationComplete} />
      )}
      
      {currentView === 'dashboard' && currentFarmer && (
        <Dashboard
          farmer={currentFarmer}
          prediction={currentPrediction}
          onDataInput={handleDataInput}
        />
      )}
      
      {currentView === 'dataInput' && currentFarmer && (
        <DataInput
          farmer={currentFarmer}
          onDataSubmitted={handleDataSubmitted}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;