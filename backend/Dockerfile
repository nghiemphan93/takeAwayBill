# pull official base image
# Stage 1: Build stage
FROM python:3.12.0-alpine AS builder
#FROM python:3.9.18-alpine
#FROM python:3.10.2-slim-buster

# set work directory
WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_APP project/__init__.py
ENV FLASK_ENV development
RUN apk add --no-cache build-base

EXPOSE 5005

RUN pip3 install --upgrade pip
COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY ./backend/ .


#ENTRYPOINT python ./backend/manage.py run -h 0.0.0.0 --port=5005
ENTRYPOINT gunicorn -b 0.0.0.0:5005 project:app
