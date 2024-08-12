from dotenv import load_dotenv
import os

load_dotenv(dotenv_path='./server/.env')

SERVER_HOST = os.getenv('SERVER_HOST', '0.0.0.0')
SERVER_PORT = int(os.getenv('SERVER_PORT', 5001))
SERVER_DEBUG_MODE = os.getenv('SERVER_DEBUG_MODE', 'False').lower() in ('true', '1', 't')
STORE_DATA_ENDPOINT = os.getenv('STORE_DATA_ENDPOINT')
DIRTY_DATA_DIR = os.getenv('DIRTY_DATA_DIR')
PROCESSED_DATA_DIR = os.getenv('PROCESSED_DATA_DIR')