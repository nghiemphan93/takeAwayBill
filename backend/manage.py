import os
from flask.cli import FlaskGroup

os.environ['TZ'] = 'Europe/Berlin'

cli = FlaskGroup()

if __name__ == "__main__":
    cli()
