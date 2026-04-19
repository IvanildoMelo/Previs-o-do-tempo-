/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ForecastItem } from '../types.ts';
import { formatTime } from '../lib/utils.ts';

interface ForecastChartProps {
  data: ForecastItem[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    time: formatTime(item.dt),
    temp: Math.round(item.temp),
    humidity: item.humidity,
  }));

  return (
    <div className="h-64 w-full mt-6 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Tendência de Temperatura (°C)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#ffffff40" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            hide 
            domain={['dataMin - 2', 'dataMax + 2']} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff'
            }}
            itemStyle={{ color: '#fbbf24' }}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#fbbf24" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
