/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cloud } from 'lucide-react';

interface WeatherIconProps {
  code: string;
  className?: string;
}

/**
 * Detailed Weather Icon component using high-quality SVG illustrations (Meteocons).
 * Falls back to Lucide if image fails to load.
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className }) => {
  // Mapping our internal codes to Meteocons SVG filenames
  // Source: https://basement.studio/weather-icons/
  const iconBaseUrl = 'https://basement.studio/weather-icons/icons';

  const [hasError, setHasError] = React.useState(false);

  // Map our service strings to specific detailed SVG filenames
  const iconMap: Record<string, string> = {
    'clear-day': 'clear-day',
    'clear-night': 'clear-night',
    'partly-cloudy-day': 'partly-cloudy-day',
    'partly-cloudy-night': 'partly-cloudy-night',
    'fog': 'fog',
    'drizzle': 'drizzle',
    'rain': 'rain',
    'showers-day': 'rain-showers-day',
    'showers-night': 'rain-showers-night',
    'thunderstorms': 'thunderstorms',
  };

  const iconName = iconMap[code] || 'cloudy';

  return (
    <div className={className}>
      {!hasError ? (
        <img
          src={`${iconBaseUrl}/${iconName}.svg`}
          alt={code}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain filter drop-shadow-lg"
          onError={() => setHasError(true)}
        />
      ) : (
        <Cloud className="w-full h-full text-white/40" />
      )}
    </div>
  );
};
