export interface PredictionInput {
  Indoor_Temperature: number;
  Outdoor_Temperature: number;
  Humidity: number;
  Occupancy: number;
  Weather_Condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Foggy';
  Time_of_Day: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  Sunlight_Intensity: number;
  Room_Size: 'Small' | 'Medium' | 'Large';
  Window_State: 'Open' | 'Closed';
}

export interface PredictionSuccessResponse {
  predicted_ideal_temperature: number;
  input_features: PredictionInput;
  timestamp: string;
  status: 'success';
}

export interface PredictionErrorResponse {
  error: string;
  status?: 'error';
  timestamp?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://smart-ac-backend.onrender.com/';

export async function getIdealTemperaturePrediction(
  data: PredictionInput
): Promise<PredictionSuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: PredictionErrorResponse = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const responseData: PredictionSuccessResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error calling prediction API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching prediction.');
  }
}
