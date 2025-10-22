from flask import Blueprint, request, jsonify
from database import get_db
from utils.spotify import fetch_album_cover
import os

bp = Blueprint("albums", __name__, url_prefix="/api/albums")


# ------------------------------
# GET ALL ALBUMS
# ------------------------------
@bp.route("/", methods=["GET"])
def get_albums():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM albums")
    albums = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(albums)


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

    # Save to database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO albums (title, artist, genre, rating, rater, just, cover_url, spotify_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["title"].strip().title(),
            data["artist"].strip().title(),
            data["genre"].strip().title(),
            float(data["rating"]),
            data["rater"].strip().title(),
            data["just"].strip(),
            cover_url,
            spotify_url,
        ),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Album added successfully"}), 201


# ------------------------------
# DELETE ALBUM
# ------------------------------
@bp.route("/<int:album_id>", methods=["DELETE"])
def delete_album(album_id):
    data = request.get_json()
    password = data.get("password") if data else None

    if password != "rishi123":
        return jsonify({"error": "Invalid password"}), 403

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM albums WHERE id = ?", (album_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Album removed"}), 200


# ------------------------------
# GET SINGLE ALBUM SPOTIFY INFO
# ------------------------------
@bp.route("/<int:album_id>/spotify", methods=["GET"])
def get_album_spotify(album_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title, artist FROM albums WHERE id = ?", (album_id,))
    album = cursor.fetchone()
    conn.close()

    if not album:
        return jsonify({"error": "Album not found"}), 404

    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    cover_url, spotify_url = fetch_album_cover(album["title"], album["artist"], client_id, client_secret)

    return jsonify({"cover_url": cover_url, "spotify_url": spotify_url})
