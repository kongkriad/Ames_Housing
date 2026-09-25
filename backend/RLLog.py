import pandas as pd
import numpy as np

import kagglehub
from kagglehub import KaggleDatasetAdapter

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import statsmodels.api as sm
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import seaborn as sns


# Set the path to the file you'd like to load
file_path = "ddproperty_2022-04-19.csv"

# Load the latest version
df = kagglehub.load_dataset(
  KaggleDatasetAdapter.PANDAS,
  "polartech/200k-homes-for-sale-in-thailand",
  file_path,
  # Provide any additional arguments like 
  # sql_query or pandas_kwargs. See the 
  # documenation for more information:
  # https://github.com/Kaggle/kagglehub/blob/main/README.md#kaggledatasetadapterpandas
)

print("First 5 records:", df.head())

def CleaningData(df):
    dfTarget = df[['living_space','land_space','bedroom_number','bathroom_number','floor_level','built_year','furnished','property_type','price']]
    dfTarget = dfTarget.dropna()
    dfTarget = dfTarget[~dfTarget['property_type'].isin(['Condo','Apartment'])].copy()
    return(dfTarget)

def Endcoding(dfTarget):
    pt = LabelEncoder()
    fu = LabelEncoder()
    dfTarget['property_type'] = pt.fit_transform(dfTarget[['property_type']])
    dfTarget['furnished'] = fu.fit_transform(dfTarget[['furnished']])
    dfTarget['floor_level'] = pd.to_numeric(dfTarget['floor_level'])
    dfTarget['log_price'] = np.log(dfTarget['price'])
    return(dfTarget)

def fitSM(dfTarget):
    X = dfTarget[[
        'living_space',
        'land_space',
        'bedroom_number',
        'bathroom_number',
        'floor_level',
        'built_year',
        'furnished',
        'property_type'
        ]]
    y = dfTarget['log_price']
    X = sm.add_constant(X)
    model = sm.OLS(y, X).fit()
    print(model.summary())

def fitLR(dfTarget):
    X = dfTarget[[
            'living_space',
            'land_space',
            'bedroom_number',
            'bathroom_number',
            'floor_level',
            'built_year',
            'furnished',
            'property_type'
            ]]
    y = dfTarget['log_price']
    model = LinearRegression()
    model.fit(X, y)