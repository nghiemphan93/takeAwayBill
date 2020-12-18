import datetime
import io
import pickle
from typing import List, Dict, Any

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

        pickledDf = pickle.dumps(billsDf.to_dict(orient='records'))
        cache.set(date, pickledDf)
        return jsonify(billsDf.to_dict(orient='records')), 200
    else:
        return jsonify(message='not authenticated'), 401


@app.route("/billsPdfByDate", methods=['POST'])
@cross_origin()
def json_to_pdf():
    print("EXPORT PDF WORK! ");
    date = request.form.get('date')
    dataBack = cache.get(date)
    dataBack: List[Dict[str, Any]] = pickle.loads(dataBack)

    print(dataBack)
    print(type(dataBack))
    print(len(dataBack))
    print(dataBack[1].get('createdAt'))

    RESOURCES_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'resource')
    REPORTS_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'report')
    input_file = os.path.join(REPORTS_DIR, 'takeAwayBill.jrxml')
    output_file = os.path.join(REPORTS_DIR, 'csv')
    conn = {
        'driver': 'csv',
        'data_file': os.path.join(self.RESOURCES_DIR, 'takeAwayBill.csv'),
        'csv_charset': 'utf-8',
        'csv_out_charset': 'utf-8',
        'csv_field_del': '|',
        'csv_out_field_del': '|',
        'csv_record_del': "\r\n",
        'csv_first_row': True,
        'csv_columns': "createdAt,orderCode,paidOnline,postcode,price".split(",")
    }
    pyreportjasper = PyReportJasper()
    self.pyreportjasper.config(
        input_file,
        output_file,
        output_formats=["pdf"],
        db_connection=conn
    )
    self.pyreportjasper.process_report()
    print('Result is the file below.')
    print(output_file + '.pdf')
