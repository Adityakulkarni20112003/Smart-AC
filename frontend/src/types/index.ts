export interface EnvironmentalData {
  indoorTemp: number;
  outdoorTemp: number;
  humidity: number;
  occupancy: number;
  weatherCondition: string;
  timeOfDay: string;
  sunlightIntensity: number;
  roomSize: number;
  windowOpen: boolean;
}

export interface Option {
  value: string;
  label: string;
}