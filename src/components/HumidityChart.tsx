/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ForecastItem } from '../types.ts';
import { formatTime } from '../lib/utils.ts';

interface HumidityChartProps {
  data: ForecastItem[];
}

export const HumidityChart: React.FC<HumidityChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    time: formatTime(item.dt),
    humidity: item.humidity,
  }));

  return (
    <div className="h-48 w-full mt-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
      <h3 className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-wider">Tendência de Humidade (%)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#ffffff20" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#3b82f6' }}
          />
          <Area 
            type="monotone" 
            dataKey="humidity" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorHumidity)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
