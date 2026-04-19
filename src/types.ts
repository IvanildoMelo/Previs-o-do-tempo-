/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  pressure: number;
  clouds: number;
  dt: number;
}

export interface ForecastItem {
  dt: number;
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  precipitation_probability: number;
}

export interface WeatherAlert {
  event: string;
  sender_name: string;
  start: number;
  end: number;
  description: string;
}

export interface WeatherFull {
  current: WeatherData;
  forecast: ForecastItem[];
  alerts?: WeatherAlert[];
}

export const NE_CITIES = [
  { name: 'Salvador', state: 'BA', lat: -12.9714, lon: -38.5014 },
  { name: 'Recife', state: 'PE', lat: -8.0476, lon: -34.8770 },
  { name: 'Fortaleza', state: 'CE', lat: -3.7172, lon: -38.5433 },
  { name: 'Natal', state: 'RN', lat: -5.7945, lon: -35.2110 },
  { name: 'João Pessoa', state: 'PB', lat: -7.1195, lon: -34.8450 },
  { name: 'Maceió', state: 'AL', lat: -9.6658, lon: -35.7353 },
  { name: 'Aracaju', state: 'SE', lat: -10.9472, lon: -37.0731 },
  { name: 'São Luís', state: 'MA', lat: -2.5297, lon: -44.3028 },
  { name: 'Teresina', state: 'PI', lat: -5.0920, lon: -42.8034 },
  { name: 'Juazeiro do Norte', state: 'CE', lat: -7.2372, lon: -39.4124 },
  { name: 'Campina Grande', state: 'PB', lat: -7.2272, lon: -35.8811 },
  { name: 'Feira de Santana', state: 'BA', lat: -12.2733, lon: -38.9556 },
  { name: 'Vitória da Conquista', state: 'BA', lat: -14.8617, lon: -40.8433 },
  { name: 'Caruaru', state: 'PE', lat: -8.2811, lon: -35.9722 },
];
