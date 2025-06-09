import { useState } from 'react';
import { getIdealTemperaturePrediction, PredictionInput } from './services/api';
import { weatherOptions, timeOptions } from './utils/constants'; // For mapping
import { SunMoon } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import ACVisualization from './components/ACVisualization';
import PredictionForm from './components/PredictionForm';
import TemperatureCard from './components/TemperatureCard';
import LoginPopup from './components/LoginPopup';
import { EnvironmentalData } from './types';
import { initialEnvironmentalData } from './utils/constants';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [predictedTemperature, setPredictedTemperature] = useState<number | null>(null);
  const [customTemperature, setCustomTemperature] = useState<number | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>(initialEnvironmentalData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFormChange = (newData: Partial<EnvironmentalData>) => {
    setEnvironmentalData(prev => ({ ...prev, ...newData }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    setPredictedTemperature(null); // Clear previous prediction

    // Map EnvironmentalData to PredictionInput
    const selectedWeatherOption = weatherOptions.find(opt => opt.value === environmentalData.weatherCondition);
    let weatherConditionApi: PredictionInput['Weather_Condition'] = 'Cloudy'; // Default
    if (selectedWeatherOption) {
      const label = selectedWeatherOption.label;
      if (['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy'].includes(label)) {
        weatherConditionApi = label as PredictionInput['Weather_Condition'];
      } else if (label === 'Partly Cloudy' || label === 'Windy') {
        weatherConditionApi = 'Cloudy';
      } else if (label === 'Stormy') {
        weatherConditionApi = 'Rainy';
      }
    }

    const selectedTimeOption = timeOptions.find(opt => opt.value === environmentalData.timeOfDay);
    let timeOfDayApi: PredictionInput['Time_of_Day'] = 'Afternoon'; // Default
    if (selectedTimeOption) {
      const labelPart = selectedTimeOption.label.split(' ')[0];
      if (['Morning', 'Afternoon', 'Evening', 'Night'].includes(labelPart)) {
        timeOfDayApi = labelPart as PredictionInput['Time_of_Day'];
      }
    }

    console.log('[App.tsx] Before API call - environmentalData.roomSize:', environmentalData.roomSize, 'Type:', typeof environmentalData.roomSize);

        let roomSizeApi: PredictionInput['Room_Size'] = 'Medium'; // Default
    if (environmentalData.roomSize === 0) roomSizeApi = 'Small';
    else if (environmentalData.roomSize === 1) roomSizeApi = 'Medium';
    else if (environmentalData.roomSize === 2) roomSizeApi = 'Large';
    // Add more conditions if other numbers are possible or log an error for unexpected values

    const apiInput: PredictionInput = {
      Indoor_Temperature: environmentalData.indoorTemp,
      Outdoor_Temperature: environmentalData.outdoorTemp,
      Humidity: environmentalData.humidity,
      Occupancy: environmentalData.occupancy,
      Weather_Condition: weatherConditionApi,
      Time_of_Day: timeOfDayApi,
      Sunlight_Intensity: environmentalData.sunlightIntensity,
      Room_Size: roomSizeApi,
      Window_State: environmentalData.windowOpen ? 'Open' : 'Closed',
    };

    try {
      const response = await getIdealTemperaturePrediction(apiInput);
      setPredictedTemperature(response.predicted_ideal_temperature);
    } catch (err: any) {
      setError(err.message || 'Failed to get prediction. Please try again.');
      console.error('Prediction API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomTemperature = (temp: number | null) => {
    setCustomTemperature(temp);
    setPredictedTemperature(temp);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
        <button 
          onClick={toggleDarkMode}
          className={`absolute top-4 right-4 p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'} shadow-lg z-10 transition-all duration-300 hover:scale-110`}
          aria-label="Toggle dark mode"
        >
          <SunMoon size={24} />
        </button>
        
        <Header />
        {error && (
          <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        <main className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8 py-8">
          <div className="w-full md:w-1/2 flex justify-center items-center relative">
            <ACVisualization darkMode={darkMode} temperature={predictedTemperature} />
            {predictedTemperature !== null && (
              <div className="absolute top-0 md:top-auto md:right-0 flex flex-col gap-4">
                <TemperatureCard 
                  temperature={predictedTemperature} 
                  darkMode={darkMode} 
                  onCustomTemperature={handleCustomTemperature}
                  customTemperature={customTemperature}
                />
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/2">
            <PredictionForm 
              environmentalData={environmentalData}
              onChange={handleFormChange}
              onPredict={handlePredict}
              isLoading={isLoading}
              darkMode={darkMode}
            />
          </div>
        </main>
        
        <Footer darkMode={darkMode} />
      </div>

      <LoginPopup darkMode={darkMode} />
    </div>
  );
}

export default App;