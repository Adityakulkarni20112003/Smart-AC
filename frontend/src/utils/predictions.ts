import { EnvironmentalData } from '../types';

/**
 * Calculates the ideal temperature based on environmental factors
 * This is a simplified model that could be replaced with a more sophisticated
 * algorithm or machine learning model in a production environment
 */
export const calculateIdealTemperature = (data: EnvironmentalData): number => {
  // Base comfortable temperature
  let idealTemp = 24;
  
  // Adjust for outdoor temperature (slight influence)
  const outdoorFactor = (data.outdoorTemp - 24) * 0.1;
  idealTemp += outdoorFactor;
  
  // Humidity adjustments (higher humidity feels warmer)
  if (data.humidity > 70) {
    idealTemp -= 1; // Compensate by cooling more
  } else if (data.humidity < 30) {
    idealTemp += 0.5; // Low humidity feels cooler
  }
  
  // Occupancy adjustments (more people = more heat)
  const occupancyAdjustment = Math.min(data.occupancy * 0.2, 2);
  idealTemp -= occupancyAdjustment;
  
  // Weather condition adjustments
  switch(data.weatherCondition) {
    case 'sunny':
      idealTemp -= 0.5;
      break;
    case 'rainy':
    case 'cloudy':
      idealTemp += 0.5;
      break;
    case 'snowy':
    case 'stormy':
      idealTemp += 1;
      break;
  }
  
  // Time of day adjustments
  switch(data.timeOfDay) {
    case 'morning':
      idealTemp += 0.5;
      break;
    case 'afternoon':
      idealTemp -= 0.5;
      break;
    case 'night':
      idealTemp += 1;
      break;
  }
  
  // Sunlight intensity (higher sunlight = cooler setting)
  const sunlightAdjustment = (data.sunlightIntensity / 10) * 1.5;
  idealTemp -= sunlightAdjustment;
  
  // Room size (larger rooms may need slight adjustments)
  if (data.roomSize > 50) {
    idealTemp += 0.5;
  }
  
  // Window state
  if (data.windowOpen) {
    // Adjust based on outdoor temperature
    if (data.outdoorTemp > data.indoorTemp) {
      idealTemp -= 1; // Compensate for warm air coming in
    } else {
      idealTemp += 0.5; // Compensate for cool air coming in
    }
  }
  
  // Round to nearest integer based on decimal value
  const decimal = idealTemp % 1;
  return decimal < 0.5 ? Math.floor(idealTemp) : Math.ceil(idealTemp);
};