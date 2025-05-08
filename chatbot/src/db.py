# database.py
from flaskext.mysql import MySQL

mysql = MySQL()

def init_mysql(app):
    app.config['MYSQL_DATABASE_HOST'] = 'localhost'
    app.config['MYSQL_DATABASE_PORT'] = 3307
    app.config['MYSQL_DATABASE_USER'] = 'tiendoan'
    app.config['MYSQL_DATABASE_PASSWORD'] = 'tiendoan'
    app.config['MYSQL_DATABASE_DB'] = 'ecommerce_inventory'
    mysql.init_app(app)