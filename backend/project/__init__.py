import datetime
import io
import uuid
from datetime import timedelta
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
    url = f'https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end={datetime.datetime.now().date().isoformat()}'
    if currentUser:
        if currentUser.isExpired():
            sessions.pop(token)
            return jsonify(message='not authenticated'), 401
        result = currentUser.getSession().get(url)
        if 'Join Takeaway.com!' not in result.text:
            return jsonify(message='authenticated'), 200
    else:
        return jsonify(message='not authenticated'), 401


@app.route("/getOrdersByDate", methods=['POST'])
@cross_origin()
def getOrdersByDate():
    token = request.headers.get('token')
    currentUser = sessions.get(token)

    date = request.form.get('date')
    sortDirection = request.form.get('sortDirection')
    sortColumn = request.form.get('sortColumn')
    if sortColumn is None:
        sortColumn = 'createdAt'

    tempDate = pd.to_datetime(date, format='%Y-%m-%d')
    if tempDate.dayofweek == 6:
        tempDate = tempDate + timedelta(days=1)
    tempDate = pd.to_datetime(tempDate, format='%Y-%m-%d')
    tempDate = f'{tempDate.year}-{tempDate.month:02d}-{tempDate.day:02d}'

    if currentUser:
        if currentUser.isExpired():
            sessions.pop(token)
            return jsonify(message='not authenticated'), 401
        result = currentUser.getSession().get(
            f'https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end={tempDate}')
        if 'Order,Date,Postcode' in result.text:
            billsDf: pd.DataFrame = pd.read_csv(io.StringIO(result.content.decode('utf-8')))
            billsDf['Total amount'] = billsDf['Total amount'].str.replace(',', '.')
            billsDf['Total amount'] = billsDf['Total amount'].astype(float)
            billsDf['Paid online'] = billsDf['Paid online'].fillna(0)
            billsDf['Date'] = pd.to_datetime(billsDf['Date'], format='%d-%m-%Y %H:%M')
            billsDf = billsDf.loc[billsDf['Date'].dt.day == pd.to_datetime(date, format='%Y-%m-%d').day]
            billsDf = billsDf.rename(
                columns={'Date': 'createdAt', 'Order': 'orderCode', 'Postcode': 'postcode', 'Total amount': 'price',
                         'Paid online': 'paidOnline'})
            billsDf = billsDf.sort_values(by=sortColumn, ascending=True and sortDirection == 'asc')
            return jsonify(billsDf.to_dict(orient='records')), 200
    else:
        return jsonify(message='not authenticated'), 401
