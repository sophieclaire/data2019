# Name: Sophie Stiekema
# Student number: 10992499

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import csv
import json

#opening csv file
data = pd.read_csv("input.csv")
data = data.set_index("Country")

# removing unecessary columns
data = data.drop(['Population', 'Area (sq. mi.)', 'Coastline (coast/area ratio)', 'Net migration', 'Literacy (%)',	'Phones (per 1000)',	'Arable (%)',	'Crops (%)',	'Other (%)',	'Climate',	'Birthrate',	'Deathrate',	'Agriculture',	'Industry','Service'], axis=1)
print(data.head())

#rename other columns
data = data.rename(columns=({'Pop. Density (per sq. mi.)':'Population', 'Infant mortality (per 1000 births)':'Mortality', 'GDP ($ per capita) dollars':'GDP'}))

# remove misisng data
data = data.mask(data=='unknown')

# convert GDP to a float
data['GDP'] = data['GDP'].str.replace('dollars', '')
data['GDP'] = data['GDP'].astype(float)

"""
    There seems to be an outlier. Suriname is said to have a GDP per capita of
    400 000 dollars. However, this is wrong, its real GDP per capita is around
    8 043 dollars according to tradingeconomics.com Therefore, I decided to
    discard this value.
"""
max = data['GDP'] == data['GDP'].max()
data = data.drop(data[max].index.item())

# calculate stats
GDP_mean = data['GDP'].mean()
GDP_mode = data['GDP'].mode()
GDP_median = data['GDP'].median()
GDP_std = data['GDP'].std()
print('mean is:', float(GDP_mean))
print('mode is:', float(GDP_mode))
print('median is:', float(GDP_median))
print('std is:', float(GDP_std))

#plot GDP
width = 1/1
plt.hist(data['GDP'].dropna())
plt.suptitle('GDP ($ per capita)', fontsize=12, fontweight='bold')
plt.xlabel("Dollars")
plt.ylabel("Frequency")
#plt.show()

# stats for Infant Mortality
data['Mortality'] = data['Mortality'].str.replace(',', '.')
data['Mortality'] = data['Mortality'].astype(float)
#print(data['Mortality'])

stats = data['Mortality'].describe()
#print(stats)

plt.boxplot(data['Mortality'].dropna())
plt.suptitle('Infant Mortality in the world', fontsize=12, fontweight='bold')
plt.xlabel("All Countries")
plt.ylabel("Mortality (per 1000 births)")
#plt.show()

jsonfile = open('file.json', 'w')

print(data.head())
dic = data.to_dict(orient='index')
jsonfile.write(json.dumps(dic))
