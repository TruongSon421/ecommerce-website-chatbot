# db.py
from flask import Flask
from flaskext.mysql import MySQL
import os
from dotenv import load_dotenv

load_dotenv()

mysql = MySQL()

def init_mysql(app: Flask):
    """Khởi tạo cấu hình MySQL cho ứng dụng Flask."""
    app.config['MYSQL_DATABASE_HOST'] = os.getenv('MYSQL_DATABASE_HOST', 'localhost')
    app.config['MYSQL_DATABASE_PORT'] = int(os.getenv('MYSQL_DATABASE_PORT', 3307))
    app.config['MYSQL_DATABASE_USER'] = os.getenv('MYSQL_DATABASE_USER', 'tiendoan')
    app.config['MYSQL_DATABASE_PASSWORD'] = os.getenv('MYSQL_DATABASE_PASSWORD', 'tiendoan')
    app.config['MYSQL_DATABASE_DB'] = os.getenv('MYSQL_DATABASE_DB', 'ecommerce_inventory')
    
    try:
        mysql.init_app(app)
        print("MySQL initialized successfully.")
    except Exception as e:
        print(f"Error initializing MySQL: {str(e)}")
        raise

def create_flask_app():
    """Tạo ứng dụng Flask để sử dụng với MySQL."""
    app = Flask(__name__)
    init_mysql(app)
    return app