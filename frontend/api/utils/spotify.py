import http.client
import base64
import json
import urllib.parse
import time

_token_cache = {"token": None, "expires": 0}

def _get_spotify_token(client_id: str, client_secret: str):
    """Fetch and cache the Spotify token for 1 hour."""
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires"]:
        return _token_cache["token"]

    credentials = f"{client_id}:{client_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    conn = http.client.HTTPSConnection("accounts.spotify.com")
    payload = "grant_type=client_credentials"
    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    conn.request("POST", "/api/token", body=payload, headers=headers)
    res = conn.getresponse()
    data = json.loads(res.read())

    token = data.get("access_token")
    if not token:
        raise RuntimeError("Failed to get Spotify token")

    _token_cache["token"] = token
    _token_cache["expires"] = now + 3500  # roughly 1 hour
    return token


def fetch_album_cover(album_title: str, album_artist: str, client_id: str, client_secret: str):
    """Fetch album cover and Spotify URL, using cached token."""
    print(f"🎧 Fetching from Spotify: {album_title} – {album_artist}")
    access_token = _get_spotify_token(client_id, client_secret)
    query = f"{album_title} artist:{album_artist}"
    encoded_query = urllib.parse.quote(query)

    conn = http.client.HTTPSConnection("api.spotify.com")
    conn.request(
        "GET",
        f"/v1/search?q={encoded_query}&type=album&limit=1",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    search_data = json.loads(conn.getresponse().read())

    items = search_data.get("albums", {}).get("items", [])
    if items:
        album_info = items[0]
        return album_info["images"][0]["url"], album_info["external_urls"]["spotify"]
    return None, None