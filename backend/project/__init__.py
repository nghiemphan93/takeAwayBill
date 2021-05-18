import datetime
import io
import uuid
from datetime import timedelta
from threading import Thread
from typing import Dict

import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import cross_origin
from requests import Session


class User:
    def __init__(self, token: str, createdAt: datetime, session: Session,
                 expireTime: timedelta = timedelta(hours=3)):
        self.token = token
        self.createdAt = createdAt
        self.session = session
        self.expireTime = expireTime

    def getCreatedAt(self) -> datetime:
        return self.createdAt

    def getExpireTime(self) -> datetime:
        return self.expireTime

    def getSession(self) -> Session:
        return self.session

    def isExpired(self) -> bool:
        return datetime.datetime.now() - self.getCreatedAt() > self.getExpireTime()


app = Flask(__name__)
sessions: Dict[str, User] = {}


@app.route("/", methods=['GET'])
@cross_origin()
def helloWorld():
    print(sessions)
    return jsonify(message='server works...')


@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    print('logging in....')

    username = request.form.get('username')
    password = request.form.get('password')
    currentSession = requests.Session()
    result = currentSession.post("https://restaurant-portal-api.takeaway.com/api/login",
                                 data={
                                     'username': username,
                                     'password': password,
                                 })
    # print(result.json())
    # print(type(result.json()))
    response = result.json()

    if response.get('code') == 200:
        # newToken = result.json().get('data').get('access_token')
        newToken = response.get('data').get('access_token')
        sessions[newToken] = User(token=newToken,
                                  createdAt=datetime.datetime.now(),
                                  session=currentSession)
        return jsonify(message='logged in successfully', token=newToken), 200
    else:
        return jsonify(message='logged in unsuccessfully'), 401


@app.route("/logout", methods=['GET'])
@cross_origin()
def logout():
    token = request.headers.get('token')
    currentUser = sessions.get(token)
    if currentUser:
        result = currentUser.getSession().post("https://restaurants-old.takeaway.com/logout")
        if 'Join Takeaway.com!' in result.text:
            sessions.pop(token)
        return jsonify(message='logged out successfully'), 200
    else:
        return jsonify(message='logged out unsuccessfully'), 500


@app.route("/initAuth", methods=['GET'])
@cross_origin()
def initAuth():
    token = request.headers.get('token')
    currentUser = sessions.get(token)
    'https://restaurant-portal-api.takeaway.com/api/restaurant/orders?period_type=week&year=2021&number=19'
    url = f'https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end={datetime.datetime.now().date().isoformat()}'
    if currentUser:
        if currentUser.isExpired():
            sessions.pop(token)
            return jsonify(message='not authenticated'), 401
        # TODO: set Bearer Token to each request
        result = currentUser.getSession().get(url)
        if 'Join Takeaway.com!' not in result.text:
            return jsonify(message='authenticated'), 200
    else:
        return jsonify(message='not authenticated'), 401


@app.route("/getOrdersByDate", methods=['POST'])
@cross_origin()
def getOrdersByDate():
    token = request.headers.get('token')
    # currentUser = sessions.get(token)

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
    print('finito')
    billsDf = pd.concat(dfs)
    print(billsDf)

    # billsDf: pd.DataFrame = pd.DataFrame(result.json().get('data').get('orders'))
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
    billsDf['paidOnline'] = billsDf['paidOnline'].apply(lambda x: 1 if x == True else 0)

    billsDf = billsDf[['createdAt', 'orderCode', 'postcode', 'price', 'paidOnline']]
    billsDf = billsDf.sort_values(by=sortColumn, ascending=True and sortDirection == 'asc')

    print(billsDf)
    return jsonify(billsDf.to_dict(orient='records')), 200
    # else:
    #     return jsonify(message='not authenticated'), 401


class ThreadWithReturnValue(Thread):
    def __init__(self, group=None, target=None, name=None,
                 args=(), kwargs={}):
        Thread.__init__(self, group, target, name, args, kwargs)
        self._return = None

    def run(self):
        if self._target is not None:
            self._return = self._target(*self._args,
                                        **self._kwargs)

    def join(self, *args):
        Thread.join(self, *args)
        return self._return


def createSingleDf(token: str, year: int, weekNumber: int, page: int) -> pd.DataFrame:
    result = requests.get(
        f'https://restaurant-portal-api.takeaway.com/api/restaurant/orders?period_type=week&year={year}&number={weekNumber}&page={page}',
        headers={"Authorization": f'Bearer {token}'})
    return pd.DataFrame(result.json().get('data').get('orders'))
