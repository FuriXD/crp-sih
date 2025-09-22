import { WeatherForecast } from '../types/farmer';

export class WeatherService {
  async getForecast(latitude: number, longitude: number): Promise<WeatherForecast[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock weather data for the next 5 days
    const forecasts: WeatherForecast[] = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: 18 + Math.random() * 8,
          max: 28 + Math.random() * 10
        },
        humidity: 60 + Math.random() * 25,
        rainfall: condition.includes('Rain') ? Math.random() * 15 : 0,
        condition,
        windSpeed: 5 + Math.random() * 15
      });
    }
    
    return forecasts;
  }

  getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      'Sunny': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Light Rain': '🌦️',
      'Heavy Rain': '🌧️'
    };
    return iconMap[condition] || '☀️';
  }

  getIrrigationAdvice(forecast: WeatherForecast[]): string {
    const rainyDays = forecast.filter(day => day.rainfall > 2).length;
    const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;
    
    if (rainyDays >= 2) {
      return 'Reduce irrigation - expect natural rainfall';
    } else if (avgHumidity < 50) {
      return 'Increase irrigation frequency due to low humidity';
    } else {
      return 'Maintain regular irrigation schedule';
    }
  }
}

export const weatherService = new WeatherService();