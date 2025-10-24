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
    try:
        response = supabase.table("albums").select("*").execute()
        return jsonify(response.data or [])
    except Exception as e:
        print("❌ Error fetching albums:", e)
        return jsonify({"error": str(e)}), 500


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

    try:
        supabase.table("albums").insert({
            "title": data["title"].strip().title(),
            "artist": data["artist"].strip().title(),
            "genre": data["genre"].strip().title(),
            "rating": float(data["rating"]),
            "rater": data["rater"].strip().title(),
            "just": data["just"].strip(),
            "cover_url": cover_url,
            "spotify_url": spotify_url
        }).execute()

        return jsonify({"message": "Album added successfully"}), 201
    except Exception as e:
        print("❌ Error adding album:", e)
        return jsonify({"error": str(e)}), 500


# ------------------------------
# DELETE ALBUM
# ------------------------------
@bp.route("/<int:album_id>", methods=["DELETE"])
def delete_album(album_id):
    data = request.get_json()
    password = data.get("password") if data else None

    if password != os.getenv("ADMIN_PASSWORD", "rishi123"):
        return jsonify({"error": "Invalid password"}), 403

    try:
        supabase.table("albums").delete().eq("id", album_id).execute()
        return jsonify({"message": "Album removed"}), 200
    except Exception as e:
        print("❌ Error deleting album:", e)
        return jsonify({"error": str(e)}), 500


# ------------------------------
# GET SINGLE ALBUM SPOTIFY INFO
# ------------------------------
@bp.route("/<int:album_id>/spotify", methods=["GET"])
def get_album_spotify(album_id):
    try:
        response = supabase.table("albums").select("title, artist").eq("id", album_id).single().execute()

        if not response.data:
            return jsonify({"error": "Album not found"}), 404

        album = response.data
        client_id = os.getenv("SPOTIFY_CLIENT_ID")
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        cover_url, spotify_url = fetch_album_cover(album["title"], album["artist"], client_id, client_secret)

        return jsonify({"cover_url": cover_url, "spotify_url": spotify_url})
    except Exception as e:
        print("❌ Error fetching Spotify info:", e)
        return jsonify({"error": str(e)}), 500
