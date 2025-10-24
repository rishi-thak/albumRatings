# routes/albums.py
from flask import Blueprint, request, jsonify
from database import supabase
from utils.spotify import fetch_album_cover
import os

bp = Blueprint("albums", __name__, url_prefix="/api/albums")


# ------------------------------
# GET ALL ALBUMS
# ------------------------------
@bp.route("/", methods=["GET"])
def get_albums():
    response = supabase.table("albums").select("*").execute()
    return jsonify(response.data or [])


# ------------------------------
# ADD NEW ALBUM
# ------------------------------
@bp.route("/", methods=["POST"])
def add_album():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    required_fields = ["title", "artist", "genre", "rating", "rater", "just"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Fetch Spotify cover + URL once
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    cover_url, spotify_url = fetch_album_cover(
        data["title"], data["artist"], client_id, client_secret
    )

    # Insert into Supabase
    result = supabase.table("albums").insert({
        "title": data["title"].strip().title(),
        "artist": data["artist"].strip().title(),
        "genre": data["genre"].strip().title(),
        "rating": float(data["rating"]),
        "rater": data["rater"].strip().title(),
        "just": data["just"].strip(),
        "cover_url": cover_url,
        "spotify_url": spotify_url
    }).execute()

    if result.error:
        return jsonify({"error": str(result.error)}), 500

    return jsonify({"message": "Album added successfully"}), 201


# ------------------------------
# DELETE ALBUM
# ------------------------------
@bp.route("/<int:album_id>", methods=["DELETE"])
def delete_album(album_id):
    data = request.get_json()
    password = data.get("password") if data else None

    if password != os.getenv("ADMIN_PASSWORD"):
        return jsonify({"error": "Invalid password"}), 403

    result = supabase.table("albums").delete().eq("id", album_id).execute()

    if result.error:
        return jsonify({"error": str(result.error)}), 500

    return jsonify({"message": "Album removed"}), 200


# ------------------------------
# GET SINGLE ALBUM SPOTIFY INFO
# ------------------------------
@bp.route("/<int:album_id>/spotify", methods=["GET"])
def get_album_spotify(album_id):
    response = supabase.table("albums").select("title, artist").eq("id", album_id).single().execute()

    if not response.data:
        return jsonify({"error": "Album not found"}), 404

    album = response.data
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    cover_url, spotify_url = fetch_album_cover(album["title"], album["artist"], client_id, client_secret)

    return jsonify({"cover_url": cover_url, "spotify_url": spotify_url})
