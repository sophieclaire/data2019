# Name: Sophie Stiekema
# Student number: 10992499
"""
This script reads a CSV file and converts it into a JSON file
"""

import csv
import json
import matplotlib.pyplot as plt
#import numpy as np
import pandas as pd

def open_csv(input):
    """
    Converts csv file into a dataframe
    """
    data = pd.read_csv(input)
    print(data.head())
    return data

def clean_data(data):
    """
    Clean & preprocess dataframe
    """
    #check for missing data:
    data_null = data[data.isnull().any(axis=1)]
    print(data_null)

    # label misisng data as NaN
    #data = data.mask(data=='unknown')

    # convert numbers to floats
    #data['Pop'] = data['Pop'].str.replace(',', '.')
    #data['Pop'] = data['Pop'].astype(float)

    # remove extra spaces
    #data['Region'] = data['Region'].str.rstrip()

    return data


def save_json(data):
    """
    Convert the dataframe to JSON via a dictionary
    """
    #create a jsonfile
    jsonfile = open('data.json', 'w')

    data = data.set_index("Rank")

    #create a dictionary to store the information & write it to json
    dic = data.to_dict(orient='index')
    jsonfile.write(json.dumps(dic))

if __name__ == "__main__":

    #open csv file
    data = open_csv("LifeQuality.csv")

    #clean data
    data = clean_data(data)

    #translate into a json file
    save_json(data)
