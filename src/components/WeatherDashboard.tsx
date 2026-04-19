/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, BellOff, Cloud, Droplets, MapPin, RefreshCw, Search, Sparkles, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { GeminiService } from '../services/geminiService.ts';
import { WeatherService } from '../services/weatherService.ts';
import { NE_CITIES, WeatherFull } from '../types.ts';
import { ForecastChart } from './ForecastChart.tsx';
import { HumidityChart } from './HumidityChart.tsx';
import { WeatherAlerts } from './WeatherAlerts.tsx';
import { WeatherIcon } from './WeatherIcon.tsx';
import { cn, formatDate, formatTime } from '../lib/utils.ts';

export const WeatherDashboard: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState(NE_CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherFull | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const sendAlertNotification = (alert: any, city: string) => {
    if (notificationPermission === 'granted') {
      new Notification(`Alerta Crítico: ${city}`, {
        body: `${alert.event}: ${alert.description}`,
        icon: '/favicon.ico', // Standard fallback
      });
    }
  };

  const fetchData = async (city = selectedCity) => {
    setLoading(true);
    setError(null);
    try {
      const data = await WeatherService.getFullWeather(city.lat, city.lon, city.name);
      setWeather(data);
      setSummary('');

      // Check for alerts and notify
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach(alert => sendAlertNotification(alert, data.current.city));
      }

      const aiSummary = await GeminiService.getWeatherSummary(data);
      setSummary(aiSummary);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados meteorológicos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=pt&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Cidade não encontrada.');
      }

      const { latitude, longitude, name } = geoData.results[0];
      
      // Setting selectedCity will trigger the useEffect to fetchData()
      setSelectedCity({ 
        name, 
        state: geoData.results[0].admin1 || '', 
        lat: latitude, 
        lon: longitude 
      });
      
      // The useEffect will handle the heavy lifting of fetching weather + summary
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar cidade.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 15 minutes (15 * 60 * 1000 ms)
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 15 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 md:p-8 font-sans">
      {/* Header & City Selector */}
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Nordeste Clima</h1>
            <p className="text-white/40 text-sm flex items-center gap-1 uppercase tracking-widest font-medium">
              <MapPin className="w-3 h-3" /> Monitoramento em Tempo Real
            </p>
            <p className="text-amber-500/40 text-[9px] font-bold uppercase tracking-tight">
              Atualizado em: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Próxima atualização em 15m
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl lg:ml-8">
            <form onSubmit={handleSearch} className="relative flex-1 flex gap-2 group">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Busque qualquer cidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-28 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <button 
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-amber-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buscar
                </button>
              </div>
            </form>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* Notification Toggle */}
              <button
                onClick={requestNotificationPermission}
                title="Ativar Alertas no Navegador"
                className={cn(
                  "p-2 rounded-xl border transition-all duration-300 mr-2",
                  notificationPermission === 'granted'
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-amber-500"
                )}
              >
                {notificationPermission === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>

              {NE_CITIES.slice(0, 5).map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    setSelectedCity(city);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-bold transition-all duration-300 border uppercase tracking-wider",
                    selectedCity.name === city.name 
                      ? "bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.2)]" 
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                  )}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-white/40 animate-pulse">Consultando satélites e sensores...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="px-6 py-2 bg-red-500 rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : weather && (
          <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Current Weather */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-amber-500/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 group">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                  <div className="space-y-4">
                    <div className="space-y-0">
                      <h2 className="text-6xl md:text-8xl font-black tracking-tighter">
                        {Math.round(weather.current.temp)}°
                      </h2>
                      <p className="text-2xl font-medium text-white/80 capitalize">{weather.current.description}</p>
                      <p className="text-white/40 mt-1 uppercase tracking-widest text-xs font-bold">{formatDate(weather.current.dt)}</p>
                    </div>
                    
                    <div className="flex gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-semibold">{weather.current.humidity}% <span className="text-white/30 font-normal">Umidade</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-semibold">{weather.current.wind_speed} <span className="text-white/30 font-normal text-[10px]">m/s</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end scale-110 md:scale-150">
                    <WeatherIcon code={weather.current.icon} className="w-32 h-32 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    <span className="mt-2 text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">OpenWeather Node</span>
                  </div>
                </div>
              </div>

              {/* Alert Section */}
              <WeatherAlerts alerts={weather.alerts || []} />

              {/* Chart Section */}
              <ForecastChart data={weather.forecast} />
            </div>

            {/* Sidebar / AI Context */}
            <div className="space-y-6">
              {/* AI Summary Card */}
              <div className="bg-[#161b2c] rounded-[2rem] p-6 border border-white/5 space-y-4 relative overflow-hidden">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Insight da IA</h3>
                </div>
                {summary ? (
                  <p className="text-sm text-white/70 leading-relaxed italic">{summary}</p>
                ) : (
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 w-full bg-white/5 rounded" />
                  </div>
                )}
                {/* Decorative Element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-amber-500/5 to-transparent rounded-full -mb-8 -mr-8" />
              </div>

              {/* Small Forecast Cards List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] px-2">Próximas Horas</h3>
                <div className="grid grid-cols-1 gap-3">
                  {weather.forecast.slice(1, 7).map((f, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default group overflow-hidden relative">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <span className="text-[10px] font-bold text-white/40 uppercase block leading-none">{formatTime(f.dt)}</span>
                          <WeatherIcon code={f.icon} className="w-8 h-8 text-white/80 mx-auto mt-1" />
                        </div>
                        <div>
                          <span className="text-lg font-bold block leading-none">{Math.round(f.temp)}°</span>
                          <span className="text-[9px] text-white/30 truncate uppercase font-medium">{f.description}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 text-right">
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/5 border border-blue-500/10">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400">{f.precipitation_probability}%</span>
                          </div>
                          <div className="flex items-center justify-end gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                            <Wind className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400">{Math.round(f.wind_speed)} <span className="text-[8px] opacity-60">m/s</span></span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center border-l border-white/5 pl-4">
                          <span className="text-[8px] text-white/20 uppercase font-black tracking-tighter mb-0.5">UV</span>
                          <span className="text-xs font-black text-amber-500">{Math.round(f.uv_index)}</span>
                        </div>
                      </div>
                      
                      {/* Subtle hover accent */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                {/* Humidity Trend Chart */}
                <HumidityChart data={weather.forecast} />
              </div>

              {/* Regional Stats */}
              <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 space-y-1">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <Cloud className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ellipsis overflow-hidden whitespace-nowrap">Cobertura em {weather.current.city}</span>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-2xl font-black">{weather.current.clouds}%</p>
                      <p className="text-[10px] text-white/40 uppercase">Cobertura de Nuvens</p>
                   </div>
                   <div className="h-1 w-24 bg-emerald-500/20 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500" style={{ width: `${weather.current.clouds}%` }} />
                   </div>
                </div>
              </div>
            </div>
          </motion.main>
        )}
      </div>
    </div>
  );
};
