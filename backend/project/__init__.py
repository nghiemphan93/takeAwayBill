from datetime import timedelta
from threading import Thread
from typing import List
import cloudscraper
from cloudscraper import CloudflareChallengeError
import time


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
    scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance
    result = scraper.post("https://restaurant-portal-api.takeaway.com/api/login",
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
    if len(dfs) > 0:
        billsDf = pd.concat(dfs)

        billsDf['Total amount'] = billsDf['amount'].str.replace(',', '.')
        billsDf['Total amount'] = billsDf['Total amount'].astype(float)
        billsDf['Paid online'] = billsDf['paid_online'].fillna(False)
        billsDf['Date'] = pd.to_datetime(billsDf['date'], format='%d-%m-%Y %H:%M:%S')

        billsDf = billsDf.loc[billsDf['Date'].dt.day == pd.to_datetime(date, format='%Y-%m-%d').day]
        billsDf = billsDf.rename(
            columns={'Date': 'createdAt', 'code': 'orderCode', 'city': 'postcode', 'Total amount': 'price',
                    'Paid online': 'paidOnline'})
        billsDf['paidOnline'] = billsDf['paidOnline'].apply(lambda x: 1 if x is True else 0)

        billsDf = billsDf[['createdAt', 'orderCode', 'postcode', 'price', 'paidOnline']]
        billsDf = billsDf.sort_values(by=sortColumn, ascending=True and sortDirection == 'asc')

        # return 200
        return jsonify(billsDf.to_dict(orient='records')), 200
    else:
        return jsonify([]), 200


@app.route("/getLiveOrders", methods=['GET'])
@cross_origin()
def getLiveOrders():
    token = request.headers.get('token')
    
    orders: List[Order] = []
    isFailed = True

    for i in range(10):
        try:
            scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance
            result = scraper.get(
                f'https://live-orders-api.takeaway.com/api/orders',
                headers={"Authorization": f'Bearer {token}'})
            isFailed = False
        except CloudflareChallengeError as e:
        # except Exception as e:
            print(f'failed {i} times')
        if not isFailed:
            for order in result.json():
                order = {
                    "placedDate": order.get('placed_date'),
                    "requestedTime": order.get('requested_time'),
                    "paymentType": order.get('payment_type'),
                    "subtotal": order.get('subtotal'),
                    "orderCode": order.get('public_reference'),
                    "customer": {
                        "fullName": order.get('customer').get('full_name'),
                        "street": order.get('customer').get('street'),
                        "streetNumber": order.get('customer').get('street_number'),
                        "postcode": order.get('customer').get('postcode'),
                        "city": order.get('customer').get('city'),
                        "extra": order.get('customer').get('extra')[0] if len(order.get('customer').get('extra')) > 0 else '',
                        "phoneNumber": order.get('customer').get('phone_number'),
                    },
                    "products": [{
                        "quantity": product.get('quantity'),
                        "name": product.get('name'),
                        "totalAmount": product.get('total_amount'),
                        "code": product.get('code'),
                        "specifications": [
                            {
                                "name": specification.get("name"),
                                "totalAmount": specification.get("total_amount")
                            } for specification in product.get('specifications')
                        ]
                    } for product in order.get('products')]
                }
                orders.append(order)
            break
    orders = sorted(orders, key=lambda order: order.get('placedDate'), reverse=True)
    
    if isFailed:
        return jsonify([]), 200
    else:
        return jsonify(orders), 200


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


class Customer:
    def __init__(self, fullName: str, street: str, streetNumber: str, postcode: int, city: str, extra: str,
                 phoneNumber: str):
        self.fullName = fullName
        self.street = street
        self.streetNumber = streetNumber
        self.postcode = postcode
        self.city = city
        self.extra = extra
        self.phoneNumber = phoneNumber


class Product:
    def __init__(self, quantity: int, name: str, totalAmount: float):
        self.quantity = quantity
        self.name = name
        self.totalAmount = totalAmount


class Order:
    def __init__(self, placedDate, requestedTime, paymentType: str, subtotal: float, customer: Customer,
                 product: Product):
        self.placedDate = placedDate
        self.requestedTime = requestedTime
        self.paymentType = paymentType
        self.subtotal = subtotal
        self.customer = customer
        self.product = product
