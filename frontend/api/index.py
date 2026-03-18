import sys
import os
from flask import Flask
from flask_cors import CORS

# Add current directory to sys.path for Vercel imports
sys.path.append(os.path.dirname(__file__))

from routes.albums import bp as albums_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://album-ratings-iwc8.vercel.app",
    "https://album-ratings.vercel.app",
    "https://albumwriter-backend.onrender.com",
    "https://rrecords.vercel.app",
    "https://rrecords.dev",
    "https://www.rrecords.dev"
])



app.register_blueprint(albums_bp)

if __name__ == "__main__":
    app.run(debug=True)
