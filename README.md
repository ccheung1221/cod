# COD

## Introduction
COD stands for correlations on demand and is a simple webapp to fuel your correlation desires. Simply type the stock ticker symbols and press the button for magic to ensue. 

## Setup
The stack consists of the following:

- JavaScript and its host of frameworks for our client-side visualizations
  - [stockcharts](http://rrag.github.io/react-stockcharts/)
  - [scatterplots](http://nvd3.org/)
- [Flask](http://flask.pocoo.org/) for the python server backend to deal with requests

## Getting Started
We use pip to install our python requirements for our backend. If you do not already have pip installed, you can get it here [`pip`](https://pip.pypa.io/en/latest/).

    $ cd cod
    $ pip install -r requirements.txt # sudo if it does not work

## Unleash the Correlations
From the base folder, run:

    ~/cod $ python server.py
From your favorite browser, goto [localhost:5000](http://localhost:5000/). 
![Diagram](https://github.com/ccheung1221/cod/blob/master/example/example1.png)
## To Do
- Autocomplete aid to find stock ticker symbols 
