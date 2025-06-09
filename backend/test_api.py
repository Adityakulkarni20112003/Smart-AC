import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_model_info():
    """Test the model info endpoint."""
    print("\nTesting model info endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_prediction():
    """Test the prediction endpoint with valid data."""
    print("\nTesting prediction endpoint with valid data...")
    
    # Sample input data
    test_data = {
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
    
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(f"{BASE_URL}/predict", 
                               json=test_data, 
                               headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_prediction_with_invalid_data():
    """Test the prediction endpoint with invalid data."""
    print("\nTesting prediction endpoint with invalid data...")
    
    # Invalid data - missing required field
    invalid_data = {
        "Indoor_Temperature": 23.5,
        "Outdoor_Temperature": 17.0,
        # Missing Humidity
        "Occupancy": 2,
        "Weather_Condition": "Cloudy",
        "Time_of_Day": "Morning",
        "Sunlight_Intensity": 650,
        "Room_Size": "Medium",
        "Window_State": "Closed"
    }
    
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(f"{BASE_URL}/predict", 
                               json=invalid_data, 
                               headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400  # Should return 400 for bad request
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_multiple_predictions():
    """Test multiple predictions with different scenarios."""
    print("\nTesting multiple prediction scenarios...")
    
    test_scenarios = [
        {
            "name": "Hot summer day",
            "data": {
                "Indoor_Temperature": 28.0,
                "Outdoor_Temperature": 32.0,
                "Humidity": 75,
                "Occupancy": 4,
                "Weather_Condition": "Sunny",
                "Time_of_Day": "Afternoon",
                "Sunlight_Intensity": 900,
                "Room_Size": "Large",
                "Window_State": "Open"
            }
        },
        {
            "name": "Cold winter morning",
            "data": {
                "Indoor_Temperature": 18.0,
                "Outdoor_Temperature": 2.0,
                "Humidity": 40,
                "Occupancy": 1,
                "Weather_Condition": "Snowy",
                "Time_of_Day": "Morning",
                "Sunlight_Intensity": 200,
                "Room_Size": "Small",
                "Window_State": "Closed"
            }
        },
        {
            "name": "Rainy evening",
            "data": {
                "Indoor_Temperature": 22.0,
                "Outdoor_Temperature": 12.0,
                "Humidity": 85,
                "Occupancy": 3,
                "Weather_Condition": "Rainy",
                "Time_of_Day": "Evening",
                "Sunlight_Intensity": 150,
                "Room_Size": "Medium",
                "Window_State": "Closed"
            }
        }
    ]
    
    results = []
    headers = {'Content-Type': 'application/json'}
    
    for scenario in test_scenarios:
        try:
            response = requests.post(f"{BASE_URL}/predict", 
                                   json=scenario["data"], 
                                   headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                predicted_temp = result.get('predicted_ideal_temperature', 'N/A')
                print(f"{scenario['name']}: {predicted_temp}°C")
                results.append((scenario['name'], predicted_temp))
            else:
                print(f"{scenario['name']}: Error - {response.status_code}")
                results.append((scenario['name'], 'Error'))
                
        except Exception as e:
            print(f"{scenario['name']}: Exception - {e}")
            results.append((scenario['name'], 'Exception'))
    
    return results

def run_all_tests():
    """Run all API tests."""
    print("=" * 50)
    print("API Testing Suite")
    print("=" * 50)
    
    # Wait a moment for the API to be ready
    print("Waiting for API to be ready...")
    time.sleep(2)
    
    test_results = {
        'health_check': test_health_check(),
        'model_info': test_model_info(),
        'valid_prediction': test_prediction(),
        'invalid_prediction': test_prediction_with_invalid_data(),
    }
    
    # Test multiple scenarios
    scenario_results = test_multiple_predictions()
    
    print("\n" + "=" * 50)
    print("Test Results Summary")
    print("=" * 50)
    
    for test_name, result in test_results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name}: {status}")
    
    print(f"\nScenario predictions:")
    for scenario_name, prediction in scenario_results:
        print(f"  {scenario_name}: {prediction}")
    
    # Overall result
    all_passed = all(test_results.values())
    print(f"\nOverall: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    
    return all_passed

if __name__ == "__main__":
    print("Make sure the Flask API is running on http://localhost:5000")
    print("You can start it by running: python flask_api.py")
    print("\nPress Enter to continue with testing...")
    input()
    
    success = run_all_tests()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        print("Your API is ready for production use.")
    else:
        print("\n⚠️  Some tests failed. Please check the API implementation.")