#!/usr/bin/env python
# Name: Sophie Stiekema
# Student number: 10992499
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'

# Create a dictionary that will contain each movie's list
dictionary = {}

def extract_movies(dom):

    """
    Extracts a list of highest rated movies from DOM (of IMDB page).
    Gets data for each movie and classifies it in a dictionary.
    """
    # Find all the movies' information
    all_movies = dom.find_all('div', class_ = "lister-item mode-advanced")

    # Append all movies'variables to dictionary
    for i in range(len(all_movies)):

        # Make a list where all movies and their info will be stored
        list = []

        # Append title to list
        if all_movies[i].h3.a.text == None:
            list.append("N/A")
        else:
            list.append(all_movies[i].h3.a.text)

        # Append rating to list
        if all_movies[i].strong.text == None:
            list.append("N/A")
        else:
            list.append(all_movies[i].strong.text)

        # Append year to list
        movie_year = all_movies[i].find('span', class_ = "lister-item-year text-muted unbold")
        new_year = ''.join(ch for ch in movie_year.text if ch.isdigit())
        if new_year == None:
            list.append("N/A")
        else:
            list.append(new_year)

        # Append actors to list
        movie_cast = all_movies[i].find_all('a', href=re.compile("adv_li_st"))

        # make a list to store all actors' names
        people =[]
        for j in range(len(movie_cast)):
            people.append(movie_cast[j].text)
        people = ", ".join(people)

        # append the list of actors to the movie's list
        if people == None:
            list.append("N/A")
        else:
            list.append(people)

        # Append runtime to list
        movie_runtime = all_movies[i].find('span', class_ = "runtime")
        if movie_runtime == None:
            list.append("N/A")
        else:
            list.append(movie_runtime.text.strip('min'))

        # Add the movie's list to the dictionary
        dictionary[i] = list

    soup = BeautifulSoup("<html>data</html>", features="html.parser")

    return [soup]

def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)

    # Write the column's labels
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    # Write the movie's variables in each column on each row
    for i in range(len(dictionary)):
        writer.writerow(dictionary[i])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
