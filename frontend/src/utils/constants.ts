import { EnvironmentalData, Option } from '../types';

export const weatherOptions: Option[] = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'partlyCloudy', label: 'Partly Cloudy' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'stormy', label: 'Stormy' },
  { value: 'snowy', label: 'Snowy' },
  { value: 'windy', label: 'Windy' },
  { value: 'foggy', label: 'Foggy' }
];

export const timeOptions: Option[] = [
  { value: 'morning', label: 'Morning (6AM-12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM-5PM)' },
  { value: 'evening', label: 'Evening (5PM-10PM)' },
  { value: 'night', label: 'Night (10PM-6AM)' }
];

export const initialEnvironmentalData: EnvironmentalData = {
  indoorTemp: 26,
  outdoorTemp: 30,
  humidity: 60,
  occupancy: 2,
  weatherCondition: 'sunny',
  timeOfDay: 'afternoon',
  sunlightIntensity: 7,
  roomSize: 25,
  windowOpen: false
};