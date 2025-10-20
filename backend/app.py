from flask import Flask
from flask_cors import CORS
from routes.albums import bp as albums_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

app.register_blueprint(albums_bp)

if __name__ == "__main__":
    app.run(debug=True)
