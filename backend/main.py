from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path

from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import kagglehub
from kagglehub import KaggleDatasetAdapter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent / "models" / "model.pkl"
ENCODERS_PATH = Path(__file__).parent / "models" / "encoders.pkl"

class PredictRequest(BaseModel):
    living_space: List[float]
    land_space: List[float]
    bedroom_number: List[float]
    bathroom_number: List[float]
    floor_level: List[float]
    built_year: List[float]
    furnished: List[int]
    property_type: List[int]

class PredictResponse(BaseModel):
    predicted_price: float

model: LinearRegression = None
property_type_encoder: LabelEncoder = None
furnished_encoder: LabelEncoder = None


def load_or_train_model():
    global model, property_type_encoder, furnished_encoder

    if MODEL_PATH.exists() and ENCODERS_PATH.exists():
        model = joblib.load(MODEL_PATH)
        encoders = joblib.load(ENCODERS_PATH)
        property_type_encoder = encoders["property_type"]
        furnished_encoder = encoders["furnished"]
        print("Loaded model from disk")
        return

    print("Training new model...")
    file_path = "ddproperty_2022-04-19.csv"
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "polartech/200k-homes-for-sale-in-thailand",
        file_path,
    )

    df_target = df[['living_space','land_space','bedroom_number','bathroom_number','floor_level','built_year','furnished','property_type','price']]
    df_target = df_target.dropna()
    df_target = df_target[~df_target['property_type'].isin(['Condo','Apartment'])].copy()

    property_type_encoder = LabelEncoder()
    furnished_encoder = LabelEncoder()
    df_target['property_type'] = property_type_encoder.fit_transform(df_target[['property_type']])
    df_target['furnished'] = furnished_encoder.fit_transform(df_target[['furnished']])
    df_target['floor_level'] = pd.to_numeric(df_target['floor_level'])
    df_target['log_price'] = np.log(df_target['price'])

    X = df_target[[
        'living_space',
        'land_space',
        'bedroom_number',
        'bathroom_number',
        'floor_level',
        'built_year',
        'furnished',
        'property_type'
    ]]
    y = df_target['log_price']

    model = LinearRegression()
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump({"property_type": property_type_encoder, "furnished": furnished_encoder}, ENCODERS_PATH)
    print("Model trained and saved")


@app.on_event("startup")
def startup_event():
    load_or_train_model()


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        X = pd.DataFrame({
            'living_space': request.living_space,
            'land_space': request.land_space,
            'bedroom_number': request.bedroom_number,
            'bathroom_number': request.bathroom_number,
            'floor_level': request.floor_level,
            'built_year': request.built_year,
            'furnished': request.furnished,
            'property_type': request.property_type
        })

        log_price_pred = model.predict(X)[0]
        predicted_price = float(np.exp(log_price_pred))
        return PredictResponse(predicted_price=predicted_price)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))