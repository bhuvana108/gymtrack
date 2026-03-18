import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv() #reads env file to find db's url

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection(): #function that calls new database connection each time
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)