import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    def __init__(self):
        self.host = os.getenv('MONGODB_HOST', 'mongodb')
        self.port = int(os.getenv('MONGODB_PORT', 27017))
        self.username = os.getenv('MONGODB_USERNAME', 'admin')
        self.password = os.getenv('MONGODB_PASSWORD', 'password')
        self.database_name = os.getenv('MONGODB_DATABASE', 'products')
        self.client = None
        self.db = None
    
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            connection_string = f"mongodb://{self.username}:{self.password}@{self.host}:{self.port}/{self.database_name}?authSource=admin"
            print(f"Connecting to: {connection_string}")
            print(f"Host: {self.host}, Port: {self.port}")
            self.client = MongoClient(connection_string)
            self.db = self.client[self.database_name]
            # Test connection
            self.client.admin.command('ping')
            print(f"Connected to MongoDB database: {self.database_name}")
            return self.db
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return None
    
    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        if self.db is None:
            self.connect()
        return self.db[collection_name] if self.db is not None else None

# Create singleton instance
mongodb = MongoDB() 