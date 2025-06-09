import React from 'react';
import { Wind } from 'lucide-react';

interface ACVisualizationProps {
  darkMode?: boolean;
  temperature?: number | null;
}

const ACVisualization: React.FC<ACVisualizationProps> = ({ darkMode = false, temperature = null }) => {
  return (
    <div className={`relative ${darkMode ? 'filter-none' : 'filter drop-shadow-xl'}`}>
      {/* Main AC Unit Body */}
      <div 
        className={`w-64 h-40 rounded-lg relative overflow-hidden
          ${darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }`}
        style={{
          boxShadow: darkMode 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Top Panel */}
        <div className={`w-full h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-end px-3`}>
          <div className="flex space-x-2">
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} animate-pulse`}></div>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
          </div>
        </div>
        
        {/* Vents */}
        <div className="absolute bottom-0 w-full h-16 flex flex-col justify-evenly px-2">
          {[1, 2, 3].map((vent) => (
            <div 
              key={vent} 
              className={`h-3 w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-sm`}
            ></div>
          ))}
        </div>
        
        {/* Display */}
        <div 
          className={`absolute top-12 left-4 w-16 h-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} rounded flex items-center justify-center`}
        >
          <span className={`text-xs font-mono ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {temperature !== null ? `${temperature}°C` : '--°C'}
          </span>
        </div>
        
        {/* Controls */}
        <div className="absolute top-12 right-4 space-y-2">
          {[1, 2, 3].map((btn) => (
            <div 
              key={btn} 
              className={`w-6 h-6 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}
            >
              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Air Flow Animation */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-1">
          <Wind 
            size={20} 
            className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} animate-pulse`} 
          />
          <Wind 
            size={24} 
            className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} animate-pulse delay-100`} 
          />
          <Wind 
            size={20} 
            className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} animate-pulse delay-200`} 
          />
        </div>
      </div>
    </div>
  );
};

export default ACVisualization;