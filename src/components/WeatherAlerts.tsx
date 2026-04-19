/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import React, { useState } from 'react';
import { WeatherAlert } from '../types.ts';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils.ts';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (alerts.length === 0) return null;

  const nextAlert = () => {
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  };

  const prevAlert = () => {
    setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
  };

  const currentAlert = alerts[currentIndex];

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <Info className="w-3 h-3 text-amber-500" /> Alertas Críticos ({alerts.length})
        </h3>
        
        {alerts.length > 1 && (
          <div className="flex gap-1">
            <button 
              onClick={prevAlert}
              className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {alerts.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-300",
                    i === currentIndex ? "bg-red-500 w-3" : "bg-white/10"
                  )} 
                />
              ))}
            </div>
            <button 
              onClick={nextAlert}
              className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/5 border border-red-500/20 rounded-[1.5rem] p-5 flex gap-5 relative group"
          >
            {/* Intensity Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
            
            <div className="bg-red-500/20 p-3 rounded-2xl h-fit border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-red-500 uppercase tracking-tight text-sm">
                  {currentAlert.event}
                </h4>
                <span className="text-[9px] font-bold text-red-500/40 uppercase border border-red-500/10 px-2 py-0.5 rounded-full bg-red-500/5">
                  Extremo
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                {currentAlert.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">
                  Monitoramento: {currentAlert.sender_name}
                </p>
                <p className="text-[9px] text-white/20 font-mono">
                  REF_XMT_{currentIndex + 1}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
