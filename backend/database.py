from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["sws_lab3"]

user_collection = db["users"]
incident_collection = db["incidents"]