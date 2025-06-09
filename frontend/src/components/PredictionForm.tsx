import React from 'react';
import { Thermometer, CloudSun, Droplets, Users, CloudRain, Clock, Sun, Home, AppWindow as Window } from 'lucide-react';
import { EnvironmentalData } from '../types';
import { weatherOptions, timeOptions } from '../utils/constants';

interface PredictionFormProps {
  isLoading?: boolean;
  environmentalData: EnvironmentalData;
  onChange: (data: Partial<EnvironmentalData>) => void;
  onPredict: () => void;
  darkMode?: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ 
  environmentalData, 
  onChange, 
  onPredict,
  darkMode = false,
  isLoading = false
}: PredictionFormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onChange({ [name]: checked });
    } else if (type === 'range' || type === 'number') {
      onChange({ [name]: parseFloat(value) });
    } else {
      onChange({ [name]: value });
    }
  };

  const inputClasses = `
    w-full px-4 py-2 rounded-lg transition-all duration-300 outline-none
    ${darkMode 
      ? 'bg-gray-800 text-white border border-gray-700 focus:border-blue-500' 
      : 'bg-white text-gray-800 border border-gray-200 focus:border-blue-500'
    }
  `;

  const labelClasses = `
    block mb-1 font-medium
    ${darkMode ? 'text-gray-300' : 'text-gray-700'}
  `;

  const iconClasses = `mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`;

  return (
    <div className={`
      rounded-xl p-6 transition-all
      ${darkMode 
        ? 'bg-gray-800/60 border border-gray-700' 
        : 'bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100'
      }
    `}>
      <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Environmental Parameters
      </h2>
      
      <form onSubmit={(e) => { e.preventDefault(); onPredict(); }} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Indoor Temperature */}
          <div>
            <label htmlFor="indoorTemp" className={labelClasses}>
              <div className="flex items-center">
                <Thermometer size={18} className={iconClasses} />
                Indoor Temperature (°C)
              </div>
            </label>
            <input 
              type="number"
              id="indoorTemp"
              name="indoorTemp"
              min="0"
              max="50"
              step="0.5"
              value={environmentalData.indoorTemp}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          
          {/* Outdoor Temperature */}
          <div>
            <label htmlFor="outdoorTemp" className={labelClasses}>
              <div className="flex items-center">
                <CloudSun size={18} className={iconClasses} />
                Outdoor Temperature (°C)
              </div>
            </label>
            <input 
              type="number"
              id="outdoorTemp"
              name="outdoorTemp"
              min="-20"
              max="50"
              step="0.5"
              value={environmentalData.outdoorTemp}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          
          {/* Humidity */}
          <div>
            <label htmlFor="humidity" className={labelClasses}>
              <div className="flex items-center">
                <Droplets size={18} className={iconClasses} />
                Humidity (%)
              </div>
            </label>
            <input 
              type="number"
              id="humidity"
              name="humidity"
              min="0"
              max="100"
              value={environmentalData.humidity}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          
          {/* Occupancy */}
          <div>
            <label htmlFor="occupancy" className={labelClasses}>
              <div className="flex items-center">
                <Users size={18} className={iconClasses} />
                Occupancy (people)
              </div>
            </label>
            <input 
              type="number"
              id="occupancy"
              name="occupancy"
              min="0"
              max="50"
              value={environmentalData.occupancy}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          
          {/* Weather Conditions */}
          <div>
            <label htmlFor="weatherCondition" className={labelClasses}>
              <div className="flex items-center">
                <CloudRain size={18} className={iconClasses} />
                Weather Conditions
              </div>
            </label>
            <select
              id="weatherCondition"
              name="weatherCondition"
              value={environmentalData.weatherCondition}
              onChange={handleInputChange}
              className={inputClasses}
              required
            >
              {weatherOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Time of Day */}
          <div>
            <label htmlFor="timeOfDay" className={labelClasses}>
              <div className="flex items-center">
                <Clock size={18} className={iconClasses} />
                Time of Day
              </div>
            </label>
            <select
              id="timeOfDay"
              name="timeOfDay"
              value={environmentalData.timeOfDay}
              onChange={handleInputChange}
              className={inputClasses}
              required
            >
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sunlight Intensity */}
          <div>
            <label htmlFor="sunlightIntensity" className={labelClasses}>
              <div className="flex items-center">
                <Sun size={18} className={iconClasses} />
                Sunlight Intensity
              </div>
            </label>
            <div className="flex items-center">
              <input 
                type="range"
                id="sunlightIntensity"
                name="sunlightIntensity"
                min="0"
                max="10"
                value={environmentalData.sunlightIntensity}
                onChange={handleInputChange}
                className={`w-full ${darkMode ? 'accent-blue-500' : 'accent-blue-600'}`}
                required
              />
              <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {environmentalData.sunlightIntensity}
              </span>
            </div>
          </div>
          
          {/* Room Size */}
          <div>
            <label htmlFor="roomSize" className={labelClasses}>
              <div className="flex items-center">
                <Home size={18} className={iconClasses} />
                Room Size (m²)
              </div>
            </label>
            <input 
              type="number"
              id="roomSize"
              name="roomSize"
              min="1"
              max="200"
              value={environmentalData.roomSize}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
          
          {/* Window State */}
          <div className="col-span-full">
            <label className={labelClasses}>
              <div className="flex items-center">
                <Window size={18} className={iconClasses} />
                Window State
              </div>
            </label>
            <div className="flex mt-2 space-x-4">
              <label className={`inline-flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input 
                  type="radio"
                  name="windowOpen"
                  value="true"
                  checked={environmentalData.windowOpen === true}
                  onChange={() => onChange({ windowOpen: true })}
                  className={`form-radio ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}
                />
                <span className="ml-2">Open</span>
              </label>
              <label className={`inline-flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input 
                  type="radio"
                  name="windowOpen"
                  value="false"
                  checked={environmentalData.windowOpen === false}
                  onChange={() => onChange({ windowOpen: false })}
                  className={`form-radio ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}
                />
                <span className="ml-2">Closed</span>
              </label>
            </div>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          className={`
            w-full mt-6 py-3 px-6 rounded-lg font-medium text-white
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
            bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            shadow-lg hover:shadow-xl
          `}
        >
          {isLoading ? 'Predicting...' : 'Predict Ideal Temperature'}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;