import ujson
import requests
import pandas as pd
from flask import Flask
from flask import render_template
from flask import request
from flask import Response
from flask import jsonify

app = Flask(__name__)

def make_csv(firstURL, secondURL):
    firstData = requests.post(firstURL)
    secondData = requests.post(secondURL)
    if firstData.status_code == 404 or secondData.status_code == 404:
        return '404', 404
    x = open('fetched_data/x.csv', 'w')
    x.write(firstData.text.replace('Date', 'date'))
    x.close()
    y = open('fetched_data/y.csv', 'w')
    y.write(secondData.text.replace('Date', 'date'))
    y.close()
    xcol = pd.read_csv('fetched_data/x.csv', usecols=[0,1,4])
    ycol = pd.read_csv('fetched_data/y.csv', usecols=[0,1,4])
    xcol['xchange'] = (xcol['Close']/xcol['Open']-1)*100
    ycol['ychange'] = (ycol['Close']/ycol['Open']-1)*100
    correlation =  xcol['xchange'].corr(ycol['ychange'])
    covariance =  xcol['xchange'].cov(ycol['ychange'])
    z = pd.concat([xcol['date'], xcol['xchange'], ycol['ychange']], axis=1)
    z.to_csv('fetched_data/data.csv', index=False)
    z.plot(kind='scatter', x='xchange', y='ychange').get_figure().savefig('static/scatterplot')
    return jsonify(correlation=correlation, covariance=covariance), 200

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def get_data():
    data = ujson.loads(request.data.decode())
    baseURL = 'http://real-chart.finance.yahoo.com/table.csv?s='
    timeURL = '&d=' + data['month'] + '&e=' + data['date'] + '&f=' + data['year'] + '&g=d&a=' + data['month'] + '&b=' + data['date'] + '&c=' + str(int(data['year']) - 5) + '&ignore=.csv'
    xURL = baseURL + data['stockX'].lower() + timeURL
    yURL = baseURL + data['stockY'].lower() + timeURL
    return make_csv(xURL, yURL)

@app.route('/getCSV')
def getCSV():
    with open ('fetched_data/x.csv') as fp:
        csv = fp.read()
    return Response(csv,
                    headers={'Content-disposition': 'attachment; filename=x.csv', 
                            'Content-type': 'text/csv'})

@app.route('/getCSV2')
def getCSV2():
    with open ('fetched_data/y.csv') as fp:
        csv = fp.read()
    return Response(csv,
                    headers={'Content-disposition': 'attachment; filename=y.csv', 
                            'Content-type': 'text/csv'})

@app.route('/getScatter')
def getScatter():
    with open ('fetched_data/data.csv') as fp:
        csv = fp.read()
    return Response(csv,
                    headers={'Content-disposition': 'attachment; filename=data.csv', 
                            'Content-type': 'text/csv'})

if __name__ == '__main__':
    app.debug = True
    app.run()