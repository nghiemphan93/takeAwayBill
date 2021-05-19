from datetime import timedelta
from threading import Thread

import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import cross_origin

app = Flask(__name__)


@app.route("/", methods=['GET'])
@cross_origin()
def helloWorld():
    return jsonify(message='server works...')


@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    currentSession = requests.Session()
    result = requests.post("https://restaurant-portal-api.takeaway.com/api/login",
                           data={
                               'username': username,
                               'password': password,
                           })
    response = result.json()

    if response.get('code') == 200:
        newToken = response.get('data').get('access_token')
        return jsonify(message='logged in successfully', token=newToken), 200
    else:
        return jsonify(message='logged in unsuccessfully'), 401


@app.route("/logout", methods=['GET'])
@cross_origin()
def logout():
    token = request.headers.get('token')
    try:
        requests.post("https://restaurant-portal-api.takeaway.com/api/logout",
                      headers={"Authorization": f'Bearer {token}'})
        return jsonify(message='logged out successfully'), 200
    except Exception:
        return jsonify(message='logged out unsuccessfully'), 500


@app.route("/getOrdersByDate", methods=['POST'])
@cross_origin()
def getOrdersByDate():
    token = request.headers.get('token')

    date = request.form.get('date')
    sortDirection = request.form.get('sortDirection')
    sortColumn = request.form.get('sortColumn')
    if sortColumn is None:
        sortColumn = 'createdAt'

    tempDate = pd.to_datetime(date, format='%Y-%m-%d')
    if tempDate.dayofweek == 6:
        tempDate = tempDate + timedelta(days=1)
    tempDate = pd.to_datetime(tempDate, format='%Y-%m-%d')
    year = tempDate.date().year
    weekNumber = tempDate.isocalendar()[1]

    result = requests.get(
        f'https://restaurant-portal-api.takeaway.com/api/restaurant/orders?period_type=week&year={year}&number={weekNumber}',
        headers={"Authorization": f'Bearer {token}'})
    totalPages = result.json().get('meta').get('total_pages')

    # combine all dfs
    threads = []
    for page in range(1, totalPages + 1):
        threads.append(ThreadWithReturnValue(target=createSingleDf, args=(token, year, weekNumber, page,)))
        threads[page - 1].start()

    dfs = []
    for thread in threads:
        df = thread.join()
        if df is not None:
            dfs.append(df)
    billsDf = pd.concat(dfs)

    billsDf['Total amount'] = billsDf['amount'].str.replace(',', '.')
    billsDf['Total amount'] = billsDf['Total amount'].astype(float)
    billsDf['Paid online'] = billsDf['paid_online'].fillna(False)
    billsDf['Date'] = pd.to_datetime(billsDf['date'], format='%d-%m-%Y %H:%M:%S')

    print(f'date from frontend: {date}')
    print(f'date from frontend: {pd.to_datetime(date, format="%Y-%m-%d").day}')
    print(f'date from backend: {billsDf["Date"].dt.day}')

    billsDf = billsDf.loc[billsDf['Date'].dt.day == pd.to_datetime(date, format='%Y-%m-%d').day]
    billsDf = billsDf.rename(
        columns={'Date': 'createdAt', 'code': 'orderCode', 'city': 'postcode', 'Total amount': 'price',
                 'Paid online': 'paidOnline'})
    billsDf['paidOnline'] = billsDf['paidOnline'].apply(lambda x: 1 if x is True else 0)

    billsDf = billsDf[['createdAt', 'orderCode', 'postcode', 'price', 'paidOnline']]
    billsDf = billsDf.sort_values(by=sortColumn, ascending=True and sortDirection == 'asc')

    return jsonify(billsDf.to_dict(orient='records')), 200


class ThreadWithReturnValue(Thread):
    def __init__(self, group=None, target=None, name=None,
                 args=(), kwargs={}):
        Thread.__init__(self, group, target, name, args, kwargs)
        self._return = None

    def run(self):
        if self._target is not None:
            self._return = self._target(*self._args,
                                        **self._kwargs)

    def join(self, *args) -> pd.DataFrame:
        Thread.join(self, *args)
        return self._return


def createSingleDf(token: str, year: int, weekNumber: int, page: int) -> pd.DataFrame:
    result = requests.get(
        f'https://restaurant-portal-api.takeaway.com/api/restaurant/orders?period_type=week&year={year}&number={weekNumber}&page={page}',
        headers={"Authorization": f'Bearer {token}'})
    return pd.DataFrame(result.json().get('data').get('orders'))
