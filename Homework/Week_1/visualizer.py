#!/usr/bin/env python
# Name: Sophie Stiekema
# Student number: 10992499
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}
counter = {str(key): [] for key in range(START_YEAR, END_YEAR)}

for key in data_dict:
    data_dict[key] = 0
    counter[key] = 0


# open csv file
with open('movies.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    # Add each rating to the dictionary & count how many ratings there are per year
    for row in reader:
        for key in data_dict:
            if row['Year'] == key:
                data_dict[key] += float(row['Rating'])
                counter[key] += 1

    # Calculate the average rating for each year
    for key in data_dict:
        data_dict[key] = data_dict[key] / counter[key]


    #plot the 1st chart, showing the overall changes in ratings
    width = 1/1.5
    plt.bar(data_dict.keys(), data_dict.values(), width, color ='pink')
    plt.plot(data_dict.keys(), data_dict.values(), width, color ='purple')
    plt.suptitle('Average movie ratings of IMDB top 50 over the years' \
    , fontsize=12, fontweight='bold')
    plt.ylim(top=10)

    plt.ylabel('Average rating')
    plt.xlabel('Year')
    plt.show()

    #plot the 2nd chart, shwoing a closer look at the variation in the ratings
    plt.plot(data_dict.keys(), data_dict.values(), width, color ='purple')
    plt.ylim(bottom=8.2)
    plt.ylim(top=8.8)
    plt.suptitle('Zoom in on the average movie ratings of IMDB top 50 over the years'\
    , fontsize=11, fontweight='bold')
    plt.ylabel('Average rating')
    plt.xlabel('Year')
    plt.show()

if __name__ == "__main__":
    print(data_dict)
