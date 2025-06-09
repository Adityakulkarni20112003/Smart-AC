import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import warnings
import os
warnings.filterwarnings('ignore')

def load_and_validate_dataset(file_path):
    """
    Load and validate the dataset from CSV file.
    
    Args:
        file_path (str): Path to the CSV file
        
    Returns:
        pandas.DataFrame: Loaded and validated dataset
    """
    # Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file '{file_path}' not found. Please check the file path.")
    
    try:
        # Load the dataset
        print(f"Loading dataset from: {file_path}")
        df = pd.read_csv(file_path)
        print(f"Dataset loaded successfully!")
        
    except Exception as e:
        raise Exception(f"Error loading dataset: {str(e)}")
    
    # Expected columns
    expected_columns = [
        'Indoor_Temperature', 'Outdoor_Temperature', 'Humidity', 'Occupancy',
        'Weather_Condition', 'Time_of_Day', 'Sunlight_Intensity', 'Room_Size', 
        'Window_State', 'Ideal_Temperature'
    ]
    
    # Check for required columns
    missing_columns = [col for col in expected_columns if col not in df.columns]
    if missing_columns:
        print(f"WARNING: Missing columns: {missing_columns}")
        print(f"Available columns: {list(df.columns)}")
        
        # Ask user if they want to continue
        response = input("Do you want to continue anyway? (y/n): ").lower()
        if response != 'y':
            raise ValueError("Missing required columns. Please check your dataset.")
    
    # Display basic info about the dataset
    print(f"\n=== Dataset Information ===")
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst 5 rows:")
    print(df.head())
    
    print(f"\nDataset info:")
    print(df.info())
    
    print(f"\nMissing values:")
    print(df.isnull().sum())
    
    # Check for missing values in target column
    if 'Ideal_Temperature' in df.columns:
        if df['Ideal_Temperature'].isnull().sum() > 0:
            print(f"WARNING: Found {df['Ideal_Temperature'].isnull().sum()} missing values in target column")
            print("Removing rows with missing target values...")
            df = df.dropna(subset=['Ideal_Temperature'])
    
    return df

def validate_categorical_values(df):
    """
    Validate and display categorical column values.
    
    Args:
        df (pandas.DataFrame): Dataset to validate
    """
    categorical_columns = ['Weather_Condition', 'Time_of_Day', 'Room_Size', 'Window_State']
    
    print(f"\n=== Categorical Values Validation ===")
    
    for col in categorical_columns:
        if col in df.columns:
            unique_values = df[col].unique()
            print(f"{col}: {list(unique_values)} (Count: {len(unique_values)})")
            
            # Check for any unusual values
            if col == 'Weather_Condition':
                expected = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy']
                unexpected = [val for val in unique_values if val not in expected]
                if unexpected:
                    print(f"  WARNING: Unexpected values in {col}: {unexpected}")
            
            elif col == 'Time_of_Day':
                expected = ['Morning', 'Afternoon', 'Evening', 'Night']
                unexpected = [val for val in unique_values if val not in expected]
                if unexpected:
                    print(f"  WARNING: Unexpected values in {col}: {unexpected}")
            
            elif col == 'Room_Size':
                expected = ['Small', 'Medium', 'Large']
                unexpected = [val for val in unique_values if val not in expected]
                if unexpected:
                    print(f"  WARNING: Unexpected values in {col}: {unexpected}")
            
            elif col == 'Window_State':
                expected = ['Open', 'Closed']
                unexpected = [val for val in unique_values if val not in expected]
                if unexpected:
                    print(f"  WARNING: Unexpected values in {col}: {unexpected}")
        else:
            print(f"{col}: Column not found in dataset")

def clean_dataset(df):
    """
    Clean the dataset by handling missing values and outliers.
    
    Args:
        df (pandas.DataFrame): Dataset to clean
        
    Returns:
        pandas.DataFrame: Cleaned dataset
    """
    print(f"\n=== Data Cleaning ===")
    original_size = len(df)
    
    # Remove rows with missing values in critical columns
    critical_columns = ['Indoor_Temperature', 'Outdoor_Temperature', 'Ideal_Temperature']
    df_clean = df.dropna(subset=critical_columns)
    
    # Fill missing values in other columns if needed
    if 'Humidity' in df.columns:
        df_clean['Humidity'] = df_clean['Humidity'].fillna(df_clean['Humidity'].median())
    
    if 'Occupancy' in df.columns:
        df_clean['Occupancy'] = df_clean['Occupancy'].fillna(0)
    
    if 'Sunlight_Intensity' in df.columns:
        df_clean['Sunlight_Intensity'] = df_clean['Sunlight_Intensity'].fillna(df_clean['Sunlight_Intensity'].median())
    
    # Remove extreme outliers (optional)
    for col in ['Indoor_Temperature', 'Outdoor_Temperature', 'Ideal_Temperature']:
        if col in df_clean.columns:
            Q1 = df_clean[col].quantile(0.01)
            Q3 = df_clean[col].quantile(0.99)
            df_clean = df_clean[(df_clean[col] >= Q1) & (df_clean[col] <= Q3)]
    
    cleaned_size = len(df_clean)
    print(f"Original dataset size: {original_size}")
    print(f"Cleaned dataset size: {cleaned_size}")
    print(f"Removed {original_size - cleaned_size} rows ({((original_size - cleaned_size)/original_size)*100:.1f}%)")
    
    return df_clean

def build_and_train_model(dataset_path):
    """
    Build, train, and evaluate the XGBoost regression model using your dataset.
    
    Args:
        dataset_path (str): Path to your CSV dataset file
    """
    # Load and validate dataset
    df = load_and_validate_dataset(dataset_path)
    
    # Validate categorical values
    validate_categorical_values(df)
    
    # Clean the dataset
    df_clean = clean_dataset(df)
    
    # Separate features and target
    if 'Ideal_Temperature' not in df_clean.columns:
        raise ValueError("Target column 'Ideal_Temperature' not found in dataset")
    
    X = df_clean.drop('Ideal_Temperature', axis=1)
    y = df_clean['Ideal_Temperature']
    
    print(f"\n=== Feature Analysis ===")
    print(f"Number of features: {X.shape[1]}")
    print(f"Number of samples: {X.shape[0]}")
    print(f"Target variable (Ideal_Temperature) statistics:")
    print(y.describe())
    
    # Define categorical and numerical columns based on your dataset
    categorical_features = []
    numerical_features = []
    
    for col in X.columns:
        if col in ['Weather_Condition', 'Time_of_Day', 'Room_Size', 'Window_State']:
            categorical_features.append(col)
        else:
            numerical_features.append(col)
    
    print(f"\nCategorical features: {categorical_features}")
    print(f"Numerical features: {numerical_features}")
    
    # Create preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', 'passthrough', numerical_features)
        ]
    )
    
    # Create the complete pipeline with XGBoost
    model_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=None
    )
    
    print(f"\n=== Data Split ===")
    print(f"Training set size: {X_train.shape[0]} samples")
    print(f"Test set size: {X_test.shape[0]} samples")
    print(f"Training set percentage: {(X_train.shape[0]/X.shape[0])*100:.1f}%")
    
    # Train the model
    print(f"\n=== Model Training ===")
    print("Training XGBoost model... This may take a few minutes.")
    
    model_pipeline.fit(X_train, y_train)
    print("Model training completed!")
    
    # Make predictions
    print("Making predictions...")
    y_train_pred = model_pipeline.predict(X_train)
    y_test_pred = model_pipeline.predict(X_test)
    
    # Evaluate the model
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    
    print(f"\n=== Model Evaluation Results ===")
    print(f"Training R² Score: {train_r2:.4f}")
    print(f"Test R² Score: {test_r2:.4f}")
    print(f"Training MAE: {train_mae:.4f}°C")
    print(f"Test MAE: {test_mae:.4f}°C")
    
    # Performance interpretation
    print(f"\n=== Performance Interpretation ===")
    if test_r2 > 0.8:
        print("✅ Excellent model performance (R² > 0.8)")
    elif test_r2 > 0.6:
        print("✅ Good model performance (0.6 < R² < 0.8)")
    elif test_r2 > 0.4:
        print("⚠️  Fair model performance (0.4 < R² < 0.6)")
    else:
        print("❌ Poor model performance (R² < 0.4)")
    
    print(f"On average, predictions are off by {test_mae:.2f}°C")
    
    # Feature importance analysis
    if categorical_features:
        try:
            feature_names = (
                list(model_pipeline.named_steps['preprocessor']
                     .named_transformers_['cat']
                     .get_feature_names_out(categorical_features)) +
                numerical_features
            )
        except:
            feature_names = [f"feature_{i}" for i in range(len(model_pipeline.named_steps['regressor'].feature_importances_))]
    else:
        feature_names = numerical_features
    
    importance_scores = model_pipeline.named_steps['regressor'].feature_importances_
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': importance_scores
    }).sort_values('importance', ascending=False)
    
    print(f"\n=== Top 10 Most Important Features ===")
    print(feature_importance.head(10).to_string(index=False))
    
    # Save the model and pipeline
    model_filename = 'ideal_temperature_model.joblib'
    joblib.dump(model_pipeline, model_filename)
    print(f"\n=== Model Saved ===")
    print(f"Model saved as: {model_filename}")
    print(f"File size: {os.path.getsize(model_filename) / 1024 / 1024:.2f} MB")
    
    # Test prediction with actual data sample
    print(f"\n=== Sample Prediction Test ===")
    sample_input = X_test.iloc[:1].copy()  # Use first test sample
    sample_actual = y_test.iloc[0]
    sample_prediction = model_pipeline.predict(sample_input)
    
    print(f"Sample input features:")
    for col, val in sample_input.iloc[0].items():
        print(f"  {col}: {val}")
    
    print(f"\nActual Ideal Temperature: {sample_actual:.2f}°C")
    print(f"Predicted Ideal Temperature: {sample_prediction[0]:.2f}°C")
    print(f"Prediction Error: {abs(sample_actual - sample_prediction[0]):.2f}°C")
    
    return model_pipeline, feature_importance

if __name__ == "__main__":
    # Specify your dataset file path here
    dataset_file = r"c:\Users\Aditya kulkarni\Desktop\backend\final_data.csv"
    print(f"Using dataset file: {dataset_file}")
    
    try:
        model, feature_importance = build_and_train_model(dataset_file)
        print(f"\n🎉 SUCCESS! Model training completed successfully!")
        print(f"📁 Model saved as: ideal_temperature_model.joblib")
        print(f"🚀 You can now run the Flask API with: python flask_api.py")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"\nPlease check:")
        print(f"1. File path is correct")
        print(f"2. CSV file exists and is readable")
        print(f"3. Required columns are present in the dataset")
        print(f"4. Data format matches the expected structure")