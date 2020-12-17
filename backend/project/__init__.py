import datetime
import io
import os
from pyreportjasper import PyReportJasper

import pandas as pd
import redis
import requests
from flask import Flask, jsonify, request
from flask_cors import cross_origin

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)
# Start the session
session = requests.Session()


@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    s = session.post("https://restaurants-old.takeaway.com/login",
                     data={
                         'user': username,
                         'pass': password,
                         'remember_login': 'on',
                         'language': 'en'
                     })
    if 'Goldene Drachen' in s.text or 'Order,Date,Postcode' in s.text:
        return jsonify(message='logged in successfully'), 200
    else:
        return jsonify(message='logged in unsuccessfully'), 401


@app.route("/logout", methods=['GET'])
@cross_origin()
def logout():
    s = session.post("https://restaurants-old.takeaway.com/logout")
    if 'Join Takeaway.com!' in s.text:
        return jsonify(message='logged out successfully'), 200
    else:
        return jsonify(message='logged out unsuccessfully'), 500


@app.route("/initAuth", methods=['GET'])
@cross_origin()
def initAuth():
    url = f'https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end={datetime.datetime.now().date().isoformat()}'
    s = session.get(url)
    if 'Join Takeaway.com!' in s.text:
        return jsonify(message='authenticated'), 401
    else:
        return jsonify(message='not authenticated'), 200


@app.route("/getOrdersByDate", methods=['POST'])
@cross_origin()
def getOrdersByDate():
    date = request.form.get('date')
    sortDirection = request.form.get('sortDirection')
    sortColumn = request.form.get('sortColumn')

    if sortColumn is None:
        sortColumn = 'createdAt'

    s = session.get(f'https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end={date}')
    if 'Order,Date,Postcode' in s.text:
        billsDf: pd.DataFrame = pd.read_csv(io.StringIO(s.content.decode('utf-8')))
        billsDf['Total amount'] = billsDf['Total amount'].str.replace(',', '.')
        billsDf['Total amount'] = billsDf['Total amount'].astype(float)
        billsDf['Paid online'] = billsDf['Paid online'].fillna(0)
        billsDf['Date'] = pd.to_datetime(billsDf['Date'], format='%d-%m-%Y %H:%M')
        billsDf = billsDf.loc[billsDf['Date'].dt.day == pd.to_datetime(date, format='%Y-%m-%d').day]
        billsDf = billsDf.rename(
            columns={'Date': 'createdAt', 'Order': 'orderCode', 'Postcode': 'postcode', 'Total amount': 'price',
                     'Paid online': 'paidOnline'})
        billsDf = billsDf.sort_values(by=sortColumn, ascending=True and sortDirection == 'asc')
        # billsDf = billsDf.iloc[pageIndex * pageSize:(pageIndex + 1) * pageSize, :]
        cache.set(date, billsDf.to_dict(orient='records'))
        return jsonify(billsDf.to_dict(orient='records')), 200
    else:
        return jsonify(message='not authenticated'), 401


@app.route("/billsPdfByDate", methods=['POST'])
@cross_origin()
def json_to_pdf():
    date = request.form.get('date')
    print(cache.get(date).decode('utf-8'))
    print(date)
    # RESOURCES_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'resources')
    # REPORTS_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'reports')
    # input_file = os.path.join(REPORTS_DIR, 'orders.jrxml')
    # output_file = os.path.join(REPORTS_DIR, 'json')
    # conn = {
    #     'driver': 'json',
    #     'data_file': os.path.join(self.RESOURCES_DIR, 'orders.json'),
    #     'json_query': 'contacts.person'
    # }
    # pyreportjasper = PyReportJasper()
    # self.pyreportjasper.config(
    #     input_file,
    #     output_file,
    #     output_formats=["pdf"],
    #     db_connection=conn
    # )
    # self.pyreportjasper.process_report()
    # print('Result is the file below.')
    # print(output_file + '.pdf')
