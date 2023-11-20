# pull official base image
FROM python:3.10.2-slim-buster

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_APP project/__init__.py
ENV FLASK_ENV development
# install dependencies
RUN pip3 install --upgrade pip
COPY requirements.txt .
RUN pip3 install -r requirements.txt

EXPOSE 5005
EXPOSE 8000

# copy project
COPY . .

#ENTRYPOINT python ./backend/manage.py run -h 0.0.0.0 --port=5005
ENTRYPOINT gunicorn backend.project:app
