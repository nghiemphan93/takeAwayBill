import redis
import requests
from flask import Flask, jsonify, request
from flask_cors import cross_origin

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)
# Start the session
session = requests.Session()


@app.route("/login", methods=['GET', 'POST'])
@cross_origin()
def login():
    username = request.args.get('username')
    password = request.args.get('password')
    s = session.post("https://restaurants-old.takeaway.com/login",
                     data={
                         'user': username,
                         'pass': password
                     })
    return jsonify(s.text)


@app.route("/logout", methods=['GET'])
@cross_origin()
def logout():
    s = session.post("https://restaurants-old.takeaway.com/logout")
    return jsonify(s.text)


@app.route("/getdatademo", methods=['GET'])
@cross_origin()
def getDataDemo():
    s = session.get('https://restaurants-old.takeaway.com/orders/archive?csv&period=week&date_end=2020-12-12')
    return jsonify(s.text)
