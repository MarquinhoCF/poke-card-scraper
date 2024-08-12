from app import create_app
from app.config.env import SERVER_HOST, SERVER_PORT, SERVER_DEBUG_MODE

app = create_app()

if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=SERVER_DEBUG_MODE)
