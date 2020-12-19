import csv
import datetime
import io
import os
import pickle

import pandas as pd
import redis
import requests
from flask import Flask, jsonify, request
from flask_cors import cross_origin
# from pyreportjasper import JasperPy
from fpdf import FPDF

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

    s = session.post("https://restaurants-old.takeaway.com/login",
                     data={
                         'user': 'Golde8',
                         'pass': '13h3ox',
                         'remember_login': 'on',
                         'language': 'en'
                     })
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

        print(billsDf.to_json(orient='index'))
        print(billsDf.to_csv(index=False))
        # return jsonify(billsDf.to_dict(orient='records')), 200
        return billsDf.to_json(orient='index'), 200
    else:
        return jsonify(message='not authenticated'), 401


@app.route("/billsPdfByDate", methods=['POST'])
@cross_origin()
def json_to_pdf():
    # print("EXPORT PDF WORK! ");
    # date = request.form.get('date')
    # dataBack = cache.get(date)
    # dataBack: List[Dict[str, Any]] = pickle.loads(dataBack)
    #
    # print(dataBack)
    # print(type(dataBack))
    # print(len(dataBack))
    # print(dataBack[1].get('createdAt'))

    date = request.form.get('date')
    s = session.post("https://restaurants-old.takeaway.com/login",
                     data={
                         'user': 'Golde8',
                         'pass': '13h3ox',
                         'remember_login': 'on',
                         'language': 'en'
                     })
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
        billsCsv = billsDf.to_csv(index=False)
        # print('c: ' + billsCsv)

        export_pdfKit();

    return billsCsv


def export_pdfKit():
    orders = open('project/seedData2.csv')
    reader = csv.reader(orders)

    for row in reader:
        print(row)

    pdf = FPDF()
    pdf.add_page()
    page_width = pdf.w - 2 * pdf.l_margin

    pdf.set_font('Times', 'B', 14.0)
    pdf.cell(page_width, 0.0, 'Students Data', align='C')
    pdf.ln(10)

    pdf.set_font('Courier', '', 12)

    col_width = page_width / 4

    pdf.ln(1)

    th = pdf.font_size

    for row in reader:
        print(row)
        pdf.cell(col_width, th, str(row[0]), border=1)
        pdf.cell(col_width, th, row[1], border=1)
        pdf.cell(col_width, th, row[2], border=1)
        pdf.cell(col_width, th, row[3], border=1)
        pdf.cell(col_width, th, row[4], border=1)
        pdf.ln(th)

    pdf.ln(10)

    pdf.set_font('Times', '', 10.0)
    pdf.cell(page_width, 0.0, '- end of report -', align='C')

    pdf.output('order.pdf', 'F')
    orders.close()

# def csv_to_pdf():
#     input_file = os.path.dirname(os.path.abspath(__file__)) + '/takeAwayBill.jrxml'
#     output = os.path.dirname(os.path.abspath(__file__)) + '/ContactsCSV'
#     data_file = os.path.dirname(os.path.abspath(__file__)) + '/seedData2.csv'
#
#     print(input_file)
#     print(output)
#     print(data_file)
#
#     jasper = JasperPy()
#     jasper.process(
#         input_file,
#         output_file=output,
#         format_list=["pdf"],
#         # parameters={},
#         # db_connection={
#         #     'data_file': data_file,
#         #     'driver': 'csv',
#         #     'csv_charset': 'utf8',
#         #     'csv_field_del': '|',
#         #     'csv_record_del': '\r\n',
#         #     'csv_first_row': True,
#         #     'csv_columns': "orderCode,createdAt,postcode,price,paidOnline".split(",")
#         # },
#         # locale='en-US'  # LOCALE Ex.:(pt_BR, de_GE)
#     )
#
#     print('Result is the file below.')
#     print(output + '.pdf')
