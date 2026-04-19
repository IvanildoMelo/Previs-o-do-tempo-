/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForecastItem, WeatherAlert, WeatherData, WeatherFull } from '../types.ts';

const METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export class WeatherService {
  static async getFullWeather(lat: number, lon: number, cityName: string): Promise<WeatherFull> {
    try {
      const url = `${METEO_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index,precipitation_probability&timezone=auto&forecast_days=2`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao buscar dados meteorológicos.');
      const data = await response.json();

      const current: WeatherData = {
        city: cityName,
        temp: data.current.temperature_2m,
        feels_like: data.current.apparent_temperature,
        temp_min: Math.min(...data.hourly.temperature_2m.slice(0, 24)),
        temp_max: Math.max(...data.hourly.temperature_2m.slice(0, 24)),
        humidity: data.current.relative_humidity_2m,
        description: this.getWmoDescription(data.current.weather_code),
        icon: this.getIconString(data.current.weather_code, data.current.is_day),
        wind_speed: data.current.wind_speed_10m,
        pressure: data.current.pressure_msl,
        clouds: data.current.cloud_cover,
        dt: Math.floor(Date.now() / 1000),
      };

      const forecast: ForecastItem[] = data.hourly.time.slice(0, 16).map((time: string, i: number) => {
        const hour = new Date(time).getHours();
        const isDayForecast = hour >= 6 && hour < 18;
        return {
          dt: Math.floor(new Date(time).getTime() / 1000),
          temp: data.hourly.temperature_2m[i],
          description: this.getWmoDescription(data.hourly.weather_code[i]),
          icon: this.getIconString(data.hourly.weather_code[i], isDayForecast ? 1 : 0),
          humidity: data.hourly.relative_humidity_2m[i],
          wind_speed: data.hourly.wind_speed_10m[i],
          uv_index: data.hourly.uv_index[i],
          precipitation_probability: data.hourly.precipitation_probability[i],
        };
      });

      const alerts = this.generateSyntheticAlerts(current, forecast);

      return { current, forecast, alerts };
    } catch (error) {
      console.error('WeatherService Error:', error);
      throw error;
    }
  }

  private static getWmoDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'Céu Limpo', 1: 'Principalmente Limpo', 2: 'Parcialmente Nublado', 3: 'Encoberto',
      45: 'Neblina', 48: 'Nevoeiro com Geada',
      51: 'Chuva Leve', 53: 'Chuva Moderada', 55: 'Chuva Forte',
      61: 'Chuva Leve', 63: 'Chuva Moderada', 65: 'Chuva Forte',
      80: 'Pancadas de Chuva Leves', 81: 'Pancadas de Chuva Moderadas', 82: 'Pancadas de Chuva Violentas',
      95: 'Trovoada Leve ou Moderada', 96: 'Trovoada com Granizo Leve', 99: 'Trovoada com Granizo Forte'
    };
    return codes[code] || 'Desconhecido';
  }

  private static getIconString(code: number, isDay: number): string {
    if (code === 0) return isDay ? 'clear-day' : 'clear-night';
    if (code <= 3) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    if (code <= 48) return 'fog';
    if (code <= 55) return 'drizzle';
    if (code <= 65) return 'rain';
    if (code <= 82) return isDay ? 'showers-day' : 'showers-night';
    if (code >= 95) return 'thunderstorms';
    return isDay ? 'clear-day' : 'clear-night';
  }

  private static generateSyntheticAlerts(current: WeatherData, forecast: ForecastItem[]): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    if (current.temp >= 35) {
      alerts.push({
        event: 'Alerta de Calor Extremo',
        sender_name: 'Sistema Nordeste Clima',
        start: current.dt,
        end: current.dt + 3600 * 4,
        description: `Temperaturas atingindo ${current.temp.toFixed(1)}°C. Risco de desidratação e insolação. Evite exposição direta ao sol entre 10h e 16h.`,
      });
    }
    const heavyRainForecast = forecast.find(f => f.description.toLowerCase().includes('chuva forte') || f.description.toLowerCase().includes('violentas'));
    if (heavyRainForecast) {
      alerts.push({
        event: 'Atenção: Chuvas Intensas',
        sender_name: 'Monitoramento Local',
        start: heavyRainForecast.dt,
        end: heavyRainForecast.dt + 3600 * 12,
        description: 'Previsão de chuvas significativas nas próximas horas. Risco de alagamentos em áreas vulneráveis.',
      });
    }
    if (current.humidity < 25) {
      alerts.push({
        event: 'Baixa Umidade do Ar',
        sender_name: 'Alerta de Saúde',
        start: current.dt,
        end: current.dt + 3600 * 8,
        description: `Umidade relativa do ar em ${current.humidity}%. Beba bastante água e evite atividades físicas intensas ao ar livre.`,
      });
    }
    return alerts;
  }
}
