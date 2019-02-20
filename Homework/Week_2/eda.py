# Name: Sophie Stiekema
# Student number: 10992499
"""
This script reads a CSV file and converts it into a JSON file
"""

import csv
import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

def open_csv(input):
    """
    Converts csv file into a dataframe
    """
    data = pd.read_csv(input)
    data = data.set_index("Country")
    return data

def clean_data(data):
    """
    Clean & preprocess dataframe
    """
    # remove unecessary columns
    data = data.drop(['Population', 'Area (sq. mi.)', 'Coastline (coast/area ratio)', 'Net migration', 'Literacy (%)',	'Phones (per 1000)',	'Arable (%)',	'Crops (%)',	'Other (%)',	'Climate',	'Birthrate',	'Deathrate',	'Agriculture',	'Industry','Service'], axis=1)

    #rename columns with shorter names
    data = data.rename(columns=({'Pop. Density (per sq. mi.)':'Pop','Infant mortality (per 1000 births)':'Mortality', 'GDP ($ per capita) dollars':'GDP'}))

    # label misisng data as NaN
    data = data.mask(data=='unknown')

    # convert numbers to floats
    data['Pop'] = data['Pop'].str.replace(',', '.')
    data['Pop'] = data['Pop'].astype(float)
    data['Mortality'] = data['Mortality'].str.replace(',', '.')
    data['Mortality'] = data['Mortality'].astype(float)
    data['GDP'] = data['GDP'].str.replace('dollars', '')
    data['GDP'] = data['GDP'].astype(float)

    # remove extra spaces
    data['Region'] = data['Region'].str.rstrip()

    """
    There seems to be an outlier. Suriname is said to have a GDP per capita of
    400 000 dollars. However, this is wrong, its real GDP per capita is around
    8 043 dollars according to tradingeconomics.com Therefore, I decided to
    discard this value.
    """
    max = data['GDP'] == data['GDP'].max()
    data = data.drop(data[max].index.item())

    return data

def get_stats(data):
    """
    Gets statistics and shows plots for GDP & Infant mortality
    """
    # calculate stats for the GDP
    GDP_mean = data['GDP'].mean()
    GDP_mode = data['GDP'].mode()
    GDP_median = data['GDP'].median()
    GDP_std = data['GDP'].std()
    print("Summary of GDP")
    print('The mean is:', "%.2f" % float(GDP_mean))
    print('The mode is:', float(GDP_mode))
    print('The median is:', float(GDP_median))
    print('The standard deviation is:', "%.2f" % float(GDP_std))

    #show a histogram of the GDP
    width = 1/1.5
    plt.hist(data['GDP'].dropna(), color ='green', ec='black')
    plt.suptitle('GDP ($ per capita) in the world', fontsize=12, fontweight='bold')
    plt.xlabel("GDP per capita")
    plt.ylabel("Frequency")
    plt.show()

    # show stats & boxplot for Infant Mortality
    stats = data['Mortality'].describe()
    print("Five Number Summary of Infant Mortality")
    print(stats)

    plt.boxplot(data['Mortality'].dropna())
    plt.suptitle('Infant Mortality in the world', fontsize=12, fontweight='bold')
    plt.xlabel("All Countries")
    plt.ylabel("Mortality (per 1000 births)")
    plt.show()

def save_json(data):
    """
    Convert the dataframe to JSON via a dictionary
    """
    #revert to original column names
    data = data.rename(columns=({'Pop':'Pop. Density (per sq. mi.)','Mortality':'Infant mortality (per 1000 births)', 'GDP':'GDP ($ per capita) dollars'}))

    #create a jsonfile
    jsonfile = open('file.json', 'w')

    #turn NaN into a string
    data = data.fillna("None")

    #create a dictionary to store the information & write it to json
    dic = data.to_dict(orient='index')
    jsonfile.write(json.dumps(dic))

if __name__ == "__main__":

    #open csv file
    data = open_csv("input.csv")

    #clean data
    data = clean_data(data)

    #get stats on some variables
    get_stats(data)

    #translate into a json file
    save_json(data)
