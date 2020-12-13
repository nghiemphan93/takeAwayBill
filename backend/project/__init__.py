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
                         'pass': password
                     })
    if 'Goldene Drachen' in s.text or 'Order,Date,Postcode' in s.text:
        return jsonify(s.text), 200
    else:
        return jsonify(s.text), 401


@app.route("/logout", methods=['GET'])
@cross_origin()
def logout():
    s = session.post("https://restaurants-old.takeaway.com/logout")
    print(s.text)
    if 'Join Takeaway.com!' in s.text:
        return jsonify(s.text), 200
    else:
        return jsonify(s.text), 500


@app.route("/getdatademo", methods=['GET'])
@cross_origin()
def getDataDemo():
    s = session.get('https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end=2020-12-12')
    return jsonify(s.text)
