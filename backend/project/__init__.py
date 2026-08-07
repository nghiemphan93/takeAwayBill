import atexit
import logging
import os

from pandas.core.frame import DataFrame
from requests.exceptions import RequestException, Timeout

os.environ['TZ'] = 'Europe/Berlin'
from datetime import timedelta, datetime
from threading import Thread
from typing import List, Dict

import cloudscraper
import pandas as pd
import requests
from flask import jsonify, request, Flask
from flask_apscheduler import APScheduler
from flask_cors import cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


# set configuration values
class Config:
    SCHEDULER_API_ENABLED = True


scheduler = APScheduler()
app = Flask(__name__)
logger = logging.getLogger(__name__)

app.config.from_object(Config())
scheduler.init_app(app)
scheduler.start()
# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())

DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME')

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
db = SQLAlchemy(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
migrate = Migrate(app, db)
TIMEOUT = 1
retry = Retry(
    total=10,
    connect=10,
    read=10,
    status=10,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=frozenset(["GET", "POST"]),
    raise_on_status=False,
)

scraper = cloudscraper.create_scraper()
adapter = HTTPAdapter(max_retries=retry)

scraper.mount("http://", adapter)
scraper.mount("https://", adapter)
session = requests.Session()
session.mount("http://", adapter)
session.mount("https://", adapter)


class Auth(db.Model):
    __tablename__ = 'auth'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Nên lưu hash password
    access_token = db.Column(db.Text, nullable=True)
    refresh_token = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f'<Auth {self.username}>'


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
                 product: Product, deliveryFee: float, restaurantTotal: float, customerTotal: float):
        self.placedDate = placedDate
        self.requestedTime = requestedTime
        self.paymentType = paymentType
        self.subtotal = subtotal
        self.restaurantTotal = restaurantTotal
        self.customerTotal: customerTotal
        self.customer = customer
        self.product = product
        self.deliveryFree = deliveryFee


class User:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

    @staticmethod
    def from_dict(source):
        return User(source.get('username'), source.get('password'))

    def to_dict(self):
        return {'username': self.username, 'password': self.password}

    def __repr__(self):
        return f'User(username={self.username}, password={self.password})'


class Token:
    def __init__(self, access_token: str, refresh_token: str):
        self.access_token = access_token
        self.refresh_token = refresh_token

    @staticmethod
    def from_dict(source):
        return Token(source.get('access_token'), source.get('refresh_token'))

    def to_dict(self):
        return {'accessToken': self.access_token, 'refreshToken': self.refresh_token}

    def __repr__(self):
        return f'Token(access_token={self.access_token}, refresh_token={self.refresh_token})'


class User:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

    @staticmethod
    def from_dict(source):
        return User(source.get('username'), source.get('password'))

    def to_dict(self):
        return {'username': self.username, 'password': self.password}

    def __repr__(self):
        return f'User(username={self.username}, password={self.password})'


def get_new_tokens() -> Token:
    print("Getting new access token")
    auth = Auth.query.get(1)
    token = Token(auth.access_token, auth.refresh_token)

    try:
        scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance
        result = scraper.post(
            "https://partner-hub.justeattakeaway.com/auth/realms/restaurant/protocol/openid-connect/token",
            data={
                'grant_type': 'refresh_token',
                'client_id': 'restaurant-portal',
                'refresh_token': token.refresh_token,
            },
            timeout=TIMEOUT
        )
        response: Dict = result.json()
        if response.get('access_token') is not None and response.get('refresh_token') is not None:
            auth.access_token = response.get('access_token')
            auth.refresh_token = response.get('refresh_token')
            db.session.commit()
        return Token(response.get('access_token'), response.get('refresh_token'))
    except (Timeout, RequestException, ValueError, AttributeError) as e:
        logger.exception('Failed to fetch metadata')
        return jsonify({"message": str(e), "errorType": "GET_METADATA_FAILED"}), 502
    except Exception:
        logger.exception("Unhandled error")
        return jsonify({"message": "Internal server error"}), 500


@app.route("/", methods=['GET'])
@cross_origin()
def helloWorld():
    now = datetime.now()
    print(f'server works, current time: {now}')
    return jsonify(message='server works...')


@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    auth = Auth.query.get(1)
    user = User(auth.username, auth.password)
    token = Token(auth.access_token, auth.refresh_token)

    if username == user.username and password == user.password:
        return jsonify(accessToken=token.access_token, refreshToken=token.refresh_token), 200
    else:
        return jsonify(message='logged in unsuccessfully'), 401


@app.route("/generate-new-tokens", methods=['GET'])
@cross_origin()
def generate_new_tokens():
    print('generating new tokens...')
    try:
        token: Token = get_new_tokens()
        return jsonify(accessToken=token.access_token, refreshToken=token.refresh_token), 200
    except Exception:
        return jsonify(message='logged in unsuccessfully'), 401


@app.route("/update-refresh-token", methods=['PUT'])
@cross_origin()
def update_refresh_token():
    print('updating refresh tokens...')
    newRefreshToken = request.form.get('newRefreshToken')
    try:
        if newRefreshToken is not None:
            auth = Auth.query.get(1)
            oldToken: Token = Token(auth.access_token, auth.refresh_token)
            auth.refresh_token = newRefreshToken
            auth.access_token = oldToken.access_token
            db.session.commit()

            return jsonify(message='refreshToken updated successfully'), 200
        else:
            return jsonify(message='refreshToken updated  unsuccessfully'), 401
    except Exception:
        return jsonify(message='refreshToken updated  unsuccessfully'), 401


@app.route("/logout", methods=['GET'])
@cross_origin()
def logout():
    accessToken = request.headers.get('accessToken')
    try:
        session.post(
            url="https://restaurant-portal-api.takeaway.com/api/logout",
            headers={"Authorization": f'Bearer {accessToken}'},
            timeout=TIMEOUT
        )
        return jsonify(message='logged out successfully'), 200
    except Exception:
        return jsonify(message='logged out unsuccessfully'), 500


@app.route("/getOrdersByDate", methods=['POST'])
@cross_origin()
def getOrdersByDate():
    access_token = request.headers.get('accessToken')

    date = request.form.get('date')
    sortDirection = request.form.get('sortDirection')
    sortColumn = request.form.get('sortColumn')
    if sortColumn is None:
        sortColumn = 'createdAt'

    tempDate = pd.to_datetime(date, format='%Y-%m-%d')
    dayOfYear = tempDate.dayofyear
    if tempDate.dayofweek == 6:
        tempDate = tempDate + timedelta(days=1)
    tempDate = pd.to_datetime(tempDate, format='%Y-%m-%d')
    year = tempDate.date().year

    print(f'day of year {dayOfYear}')
    totalPages = 0
    try:
        result = session.get(
            f'https://restaurant-portal-api.takeaway.com/api/restaurant/orders?period_type=day&year={year}&number={dayOfYear}',
            headers={"Authorization": f'Bearer {access_token}'},
            timeout=TIMEOUT
        )
        totalPages = result.json().get('meta').get('total_pages')
    except (Timeout, RequestException, ValueError, AttributeError) as e:
        logger.exception('Failed to fetch metadata')
        return jsonify({"message": str(e), "errorType": "GET_METADATA_FAILED"}), 502
    except Exception:
        logger.exception("Unhandled error")
        return jsonify({"message": "Internal server error"}), 500

    # combine all dfs
    threads = []
    for page in range(1, totalPages + 1):
        threads.append(ThreadWithReturnValue(target=createSingleDf, args=(access_token, year, dayOfYear, page,)))
        threads[page - 1].start()

    dfs = []
    for thread in threads:
        df: DataFrame = thread.join()
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

        print(f'got {len(billsDf)} orders')
        return jsonify(billsDf.to_dict(orient='records')), 200
    else:
        return jsonify([]), 200


@app.route("/getLiveOrders", methods=['GET'])
@cross_origin()
def getLiveOrders():
    access_token = request.headers.get('accessToken')

    orders: List[Order] = []
    try:
        scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance
        result = scraper.get(
            f'https://live-orders-api.takeaway.com/api/orders',
            headers={"Authorization": f'Bearer {access_token}'},
            timeout=TIMEOUT
        )

        for order in result.json():
            order = {
                "placedDate": order.get('placed_date'),
                "requestedTime": order.get('requested_time'),
                "paymentType": order.get('payment_type'),
                "subtotal": order.get('subtotal'),
                "restaurantTotal": order.get('restaurant_total'),
                "customerTotal": order.get('customer_total'),
                "orderCode": order.get('public_reference'),
                "deliveryFree": order.get('delivery_fee'),
                "customer": {
                    "fullName": order.get('customer').get('full_name'),
                    "street": order.get('customer').get('street'),
                    "streetNumber": order.get('customer').get('street_number'),
                    "postcode": order.get('customer').get('postcode'),
                    "city": order.get('customer').get('city'),
                    "extra": order.get('customer').get('extra')[0] if len(
                        order.get('customer').get('extra')) > 0 else '',
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
                } for product in order.get('products')],
                "status": order.get('status')
            }
            orders.append(order)
        print(f'got {len(orders)} live orders...')
        orders = sorted(orders, key=lambda order: order.get('placedDate'), reverse=True)
        return jsonify(orders), 200

    except (Timeout, RequestException, ValueError, AttributeError) as e:
        logger.exception('Failed to fetch metadata')
        return jsonify({"message": str(e), "errorType": "GET_METADATA_FAILED"}), 502
    except Exception:
        logger.exception("Unhandled error")
        return jsonify({"message": "Internal server error"}), 500


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


def createSingleDf(token: str, year: int, dayOfYear: int, page: int) -> pd.DataFrame:
    try:
        result = session.get(
            f'https://restaurant-portal-api.takeaway.com/api/restaurant/orders?period_type=day&year={year}&number={dayOfYear}&page={page}',
            headers={"Authorization": f'Bearer {token}'},
            timeout=TIMEOUT
        )
        return pd.DataFrame(result.json().get('data').get('orders'))
    except (Timeout, RequestException, ValueError, AttributeError) as e:
        logger.exception("Failed page=%s", page)
        return None
    except Exception:
        logger.exception("Unhandled error")
        return None
