from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import logging
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable for the model pipeline
model_pipeline = None

# Load the model when the application module is initialized
# This ensures Gunicorn loads the model when starting workers.
def initialize_model():
    """Wrapper function to load model and log status."""
    if not load_model():
        logger.critical("CRITICAL: Model could not be loaded during app initialization. Predictions will likely fail. Check previous logs from load_model() for details.")
        # For a production system, you might consider if the app should forcefully exit if the model is absolutely essential for all operations.
        # For example, by raising an exception here that Gunicorn might handle by not starting workers, or by calling sys.exit(1) if appropriate.
    else:
        logger.info("Model loading process completed at application startup (called from initialize_model).")

# Call model initialization here so it runs when the module is imported
initialize_model()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# Global variables to store model and feature info
model_pipeline = None
expected_features = [
    'Indoor_Temperature', 'Outdoor_Temperature', 'Humidity', 'Occupancy',
    'Weather_Condition', 'Time_of_Day', 'Sunlight_Intensity', 'Room_Size', 'Window_State'
]

# Valid categorical values (for validation)
valid_categories = {
    'Weather_Condition': ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy'],
    'Time_of_Day': ['Morning', 'Afternoon', 'Evening', 'Night'],
    'Room_Size': ['Small', 'Medium', 'Large'],
    'Window_State': ['Open', 'Closed']
}

def load_model():
    """Load the trained model pipeline."""
    global model_pipeline
    try:
        # Construct absolute path to the model file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_filename = os.path.join(base_dir, 'ideal_temperature_model.joblib')
        
        logger.info(f"Attempting to load model from: {model_filename}")

        if not os.path.exists(model_filename):
            logger.error(f"Model file NOT FOUND at: {model_filename}")
            # Log current working directory and contents for debugging
            logger.error(f"Current working directory: {os.getcwd()}")
            try:
                logger.error(f"Files in script's directory ({base_dir}): {os.listdir(base_dir)}")
            except Exception as list_e:
                logger.error(f"Could not list files in script's directory: {list_e}")
            raise FileNotFoundError(f"Model file '{model_filename}' not found. Please ensure it is in the same directory as flask_api.py and deployed correctly.")
        
        model_pipeline = joblib.load(model_filename)
        logger.info(f"Model loaded successfully from {model_filename}")
        return True
    except Exception as e:
        logger.error(f"Error loading model from {model_filename}: {str(e)}")
        # Log current working directory and contents for debugging if error occurs after path check
        logger.error(f"Current working directory during error: {os.getcwd()}")
        base_dir_on_error = os.path.dirname(os.path.abspath(__file__))
        model_filename_on_error = os.path.join(base_dir_on_error, 'ideal_temperature_model.joblib')
        logger.error(f"Checked path during error: {model_filename_on_error}")
        try:
            logger.error(f"Files in script's directory during error ({base_dir_on_error}): {os.listdir(base_dir_on_error)}")
        except Exception as list_e:
            logger.error(f"Could not list files in script's directory during error: {list_e}")
        return False

def validate_input(data):
    """
    Validate input data format and values.
    
    Args:
        data (dict): Input data to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check if all required features are present
    missing_features = [feature for feature in expected_features if feature not in data]
    if missing_features:
        return False, f"Missing required features: {missing_features}"
    
    # Check data types and ranges
    try:
        # Validate numerical features
        if not isinstance(data['Indoor_Temperature'], (int, float)):
            return False, "Indoor_Temperature must be a number"
        if not isinstance(data['Outdoor_Temperature'], (int, float)):
            return False, "Outdoor_Temperature must be a number"
        if not isinstance(data['Humidity'], int) or not (0 <= data['Humidity'] <= 100):
            return False, "Humidity must be an integer between 0 and 100"
        if not isinstance(data['Occupancy'], int) or data['Occupancy'] < 0:
            return False, "Occupancy must be a non-negative integer"
        if not isinstance(data['Sunlight_Intensity'], int) or data['Sunlight_Intensity'] < 0:
            return False, "Sunlight_Intensity must be a non-negative integer"
        
        # Validate categorical features
        for cat_feature, valid_values in valid_categories.items():
            if data[cat_feature] not in valid_values:
                return False, f"{cat_feature} must be one of: {valid_values}"
        
        return True, None
        
    except Exception as e:
        return False, f"Data validation error: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model_pipeline is not None
    })

@app.route('/predict', methods=['POST'])
def predict_temperature():
    """
    Predict ideal temperature based on input features.
    
    Expected JSON input:
    {
        "Indoor_Temperature": 23.5,
        "Outdoor_Temperature": 17.0,
        "Humidity": 55,
        "Occupancy": 2,
        "Weather_Condition": "Cloudy",
        "Time_of_Day": "Morning",
        "Sunlight_Intensity": 650,
        "Room_Size": "Medium",
        "Window_State": "Closed"
    }
    """
    try:
        # Check if model is loaded
        if model_pipeline is None:
            return jsonify({
                'error': 'Model not loaded. Please ensure the model file exists and restart the server.'
            }), 500
        
        # Get JSON data from request
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate input data
        is_valid, error_message = validate_input(data)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Create DataFrame for prediction
        input_df = pd.DataFrame([data])
        
        # Make prediction
        prediction = model_pipeline.predict(input_df)
        predicted_temperature = float(prediction[0])
        
        # Log the prediction
        logger.info(f"Prediction made: {predicted_temperature:.2f}°C for input: {data}")
        
        # Return prediction
        response = {
            'predicted_ideal_temperature': round(predicted_temperature, 2),
            'input_features': data,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}',
            'status': 'error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model."""
    if model_pipeline is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        # Get feature names after preprocessing
        categorical_features = ['Weather_Condition', 'Time_of_Day', 'Room_Size', 'Window_State']
        numerical_features = ['Indoor_Temperature', 'Outdoor_Temperature', 'Humidity', 
                            'Occupancy', 'Sunlight_Intensity']
        
        feature_names = (
            list(model_pipeline.named_steps['preprocessor']
                 .named_transformers_['cat']
                 .get_feature_names_out(categorical_features)) +
            numerical_features
        )
        
        model_info_dict = {
            'model_type': 'XGBoost Regressor',
            'expected_features': expected_features,
            'valid_categories': valid_categories,
            'total_features_after_preprocessing': len(feature_names),
            'feature_names_after_preprocessing': feature_names[:10],  # Show first 10
            'model_parameters': {
                'n_estimators': model_pipeline.named_steps['regressor'].n_estimators,
                'max_depth': model_pipeline.named_steps['regressor'].max_depth,
                'learning_rate': model_pipeline.named_steps['regressor'].learning_rate
            }
        }
        
        return jsonify(model_info_dict)
        
    except Exception as e:
        return jsonify({'error': f'Error getting model info: {str(e)}'}), 500

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API documentation."""
    documentation = {
        'message': 'Ideal Temperature Prediction API',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': 'Predict ideal temperature',
            'GET /health': 'Health check',
            'GET /model-info': 'Get model information',
            'GET /': 'This documentation'
        },
        'sample_request': {
            'url': '/predict',
            'method': 'POST',
            'headers': {'Content-Type': 'application/json'},
            'body': {
                'Indoor_Temperature': 23.5,
                'Outdoor_Temperature': 17.0,
                'Humidity': 55,
                'Occupancy': 2,
                'Weather_Condition': 'Cloudy',
                'Time_of_Day': 'Morning',
                'Sunlight_Intensity': 650,
                'Room_Size': 'Medium',
                'Window_State': 'Closed'
            }
        },
        'sample_response': {
            'predicted_ideal_temperature': 24.85,
            'input_features': '...',
            'timestamp': '2024-01-01T12:00:00',
            'status': 'success'
        }
    }
    
    return jsonify(documentation)

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # The app.run() call is for direct execution (e.g., python flask_api.py)
    # Gunicorn does not use this block for serving the application.
    # Model loading is now handled at the module level.
    # If you had app.run() here, keep it for local testing.
    # Example: app.run(debug=True, host='0.0.0.0', port=5000)
    pass # Placeholder if nothing else is in this block
    
    # Run the Flask app
    print("Starting Flask API server...")
    print("API Documentation available at: http://localhost:5000/")
    print("Health check available at: http://localhost:5000/health")
    print("Prediction endpoint: http://localhost:5000/predict")
    
    app.run(debug=True, host='0.0.0.0', port=5000)