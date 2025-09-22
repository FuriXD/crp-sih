import { AIPrediction, SoilData, CropDetail, SensorData } from '../types/farmer';

// Simulated AI engine for crop yield predictions
export class AIEngine {
  async generatePrediction(
    farmerId: string,
    cropDetails: CropDetail[],
    soilData: SoilData,
    sensorData?: SensorData
  ): Promise<AIPrediction> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const crop = cropDetails[0]; // Use first crop for demo
    
    // Calculate yield based on soil conditions and growth stage
    const yieldBase = this.calculateBaseYield(crop.cropType);
    const soilFactor = this.calculateSoilFactor(soilData);
    const stageFactor = this.getStageMultiplier(crop.growthStage);
    const estimatedYield = yieldBase * soilFactor * stageFactor;
    
    // Generate irrigation recommendation
    const moistureLevel = sensorData?.soilMoisture || soilData.moisture;
    const irrigationNeeded = moistureLevel < 60;
    
    // Generate fertilizer recommendation based on soil nutrients
    const fertilizerType = this.recommendFertilizer(soilData);
    
    // Assess pest/disease risk based on conditions
    const pestRisk = this.assessPestRisk(soilData, crop.growthStage);
    
    return {
      id: `pred_${Date.now()}`,
      farmerId,
      cropId: crop.id,
      yieldForecast: {
        estimated: Math.round(estimatedYield * 100) / 100,
        confidence: 0.78 + Math.random() * 0.15,
        unit: 'tonnes/hectare',
        reasoning: [
          `Soil pH of ${soilData.ph} is optimal for ${crop.cropType}`,
          `Current growth stage (${crop.growthStage}) shows healthy development`,
          `Organic matter content (${soilData.organicMatter}%) supports good nutrition`
        ]
      },
      irrigationSchedule: {
        nextIrrigation: irrigationNeeded ? 'Today' : 'In 2 days',
        amount: irrigationNeeded ? 25 : 20,
        frequency: 'Every 3-4 days',
        reasoning: [
          `Current soil moisture at ${Math.round(moistureLevel)}%`,
          `Crop water requirement for ${crop.growthStage} stage`,
          'Weather forecast shows no rain in next 3 days'
        ],
        confidence: 0.82 + Math.random() * 0.12
      },
      fertilizerRecommendation: {
        type: fertilizerType.type,
        quantity: fertilizerType.quantity,
        timing: fertilizerType.timing,
        reasoning: [
          `Nitrogen level (${soilData.nitrogen}ppm) is ${soilData.nitrogen < 30 ? 'low' : 'adequate'}`,
          `Phosphorus content (${soilData.phosphorus}ppm) needs supplementation`,
          `Potassium levels (${soilData.potassium}ppm) are sufficient`
        ],
        confidence: 0.75 + Math.random() * 0.18
      },
      pestDiseaseRisk: {
        risk: pestRisk.level,
        threats: pestRisk.threats,
        preventiveMeasures: pestRisk.preventive,
        confidence: 0.72 + Math.random() * 0.20
      },
      generatedDate: new Date().toISOString()
    };
  }

  private calculateBaseYield(cropType: string): number {
    const yieldMap: Record<string, number> = {
      'rice': 4.5,
      'wheat': 3.2,
      'maize': 5.8,
      'cotton': 2.1,
      'sugarcane': 75.0,
      'potato': 22.0,
      'tomato': 35.0,
      'onion': 18.0
    };
    return yieldMap[cropType.toLowerCase()] || 3.0;
  }

  private calculateSoilFactor(soil: SoilData): number {
    let factor = 1.0;
    
    // pH factor (6.0-7.5 is optimal)
    if (soil.ph >= 6.0 && soil.ph <= 7.5) {
      factor *= 1.1;
    } else if (soil.ph < 5.5 || soil.ph > 8.0) {
      factor *= 0.85;
    }
    
    // Organic matter (3-5% is good)
    if (soil.organicMatter >= 3) {
      factor *= 1.05;
    } else if (soil.organicMatter < 1.5) {
      factor *= 0.9;
    }
    
    // Nutrient levels
    if (soil.nitrogen > 30) factor *= 1.02;
    if (soil.phosphorus > 20) factor *= 1.02;
    if (soil.potassium > 150) factor *= 1.02;
    
    return Math.max(0.7, Math.min(1.3, factor));
  }

  private getStageMultiplier(stage: string): number {
    const stageMap: Record<string, number> = {
      'seedling': 0.95,
      'vegetative': 1.0,
      'flowering': 1.05,
      'fruiting': 1.02,
      'maturing': 0.98
    };
    return stageMap[stage.toLowerCase()] || 1.0;
  }

  private recommendFertilizer(soil: SoilData): { type: string; quantity: number; timing: string } {
    if (soil.nitrogen < 30) {
      return {
        type: 'Urea (46% N)',
        quantity: 120,
        timing: 'Apply in 2 splits: now and after 3 weeks'
      };
    } else if (soil.phosphorus < 20) {
      return {
        type: 'DAP (18-46-0)',
        quantity: 100,
        timing: 'Apply as basal dose before next irrigation'
      };
    } else {
      return {
        type: 'NPK (10-26-26)',
        quantity: 80,
        timing: 'Apply during vegetative growth stage'
      };
    }
  }

  private assessPestRisk(soil: SoilData, stage: string): {
    level: 'low' | 'medium' | 'high';
    threats: string[];
    preventive: string[];
  } {
    const threats: string[] = [];
    const preventive: string[] = [];
    
    // High moisture increases fungal risk
    if (soil.moisture > 80) {
      threats.push('Fungal diseases', 'Root rot');
      preventive.push('Improve drainage', 'Apply fungicide preventively');
    }
    
    // Growth stage specific risks
    if (stage === 'flowering') {
      threats.push('Bollworm', 'Aphids');
      preventive.push('Monitor pest population weekly', 'Use pheromone traps');
    }
    
    // Temperature and humidity based risks
    if (soil.temperature > 30) {
      threats.push('Thrips', 'Spider mites');
      preventive.push('Maintain soil moisture', 'Use reflective mulch');
    }
    
    const riskLevel = threats.length > 3 ? 'high' : threats.length > 1 ? 'medium' : 'low';
    
    return {
      level: riskLevel,
      threats: threats.slice(0, 3),
      preventive: preventive.slice(0, 3)
    };
  }
}

export const aiEngine = new AIEngine();