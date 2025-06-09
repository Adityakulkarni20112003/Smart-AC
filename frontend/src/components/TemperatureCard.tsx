import React, { useState } from 'react';
import { Thermometer } from 'lucide-react';

interface TemperatureCardProps {
  temperature: number;
  darkMode?: boolean;
  onCustomTemperature?: (temp: number | null) => void;
  customTemperature?: number | null;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({ 
  temperature, 
  darkMode = false,
  onCustomTemperature,
  customTemperature
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const temp = parseFloat(inputValue);
    if (!isNaN(temp) && onCustomTemperature) {
      onCustomTemperature(temp);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div 
        className={`
          relative px-6 py-4 rounded-lg backdrop-blur-sm transition-all duration-500
          transform hover:scale-105
          ${darkMode 
            ? 'bg-gray-800/80 text-white border border-blue-500/30' 
            : 'bg-white/80 text-gray-800 border border-blue-200'
          }
        `}
        style={{
          boxShadow: darkMode 
            ? '0 0 15px rgba(59, 130, 246, 0.3)' 
            : '0 0 20px rgba(59, 130, 246, 0.15)',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        <div className="absolute -top-3 -left-3 p-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500">
          <Thermometer size={20} className="text-white" />
        </div>
        
        <div className="mt-1">
          <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            PREDICTED IDEAL
          </p>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-1">{temperature}</span>
            <span className={`text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>°C</span>
          </div>
        </div>
        
        <div 
          className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${darkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)'} 0%, transparent 70%)`,
          }}
        ></div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`
              w-full px-4 py-2 rounded-lg outline-none
              ${darkMode 
                ? 'bg-gray-800/80 text-white border border-blue-500/30' 
                : 'bg-white/80 text-gray-800 border border-blue-200'
              }
            `}
            placeholder="Enter temperature"
            autoFocus
          />
          <button
            type="submit"
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              px-2 py-1 rounded text-sm
              ${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}
            `}
          >
            Set
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={`
            w-full px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-300
            ${darkMode 
              ? 'bg-gray-800/80 text-white border border-blue-500/30 hover:bg-gray-700/80' 
              : 'bg-white/80 text-gray-800 border border-blue-200 hover:bg-gray-50/80'
            }
          `}
        >
          Set Your Own Temperature
        </button>
      )}
    </div>
  );
};

export default TemperatureCard;