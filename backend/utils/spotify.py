import http.client
import base64
import json
import urllib.parse

def fetch_album_cover(album_title: str, album_artist: str, client_id: str, client_secret: str):
    credentials = f"{client_id}:{client_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    # Get token
    conn = http.client.HTTPSConnection("accounts.spotify.com")
    payload = "grant_type=client_credentials"
    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    conn.request("POST", "/api/token", body=payload, headers=headers)
    res = conn.getresponse()
    data = json.loads(res.read())

    access_token = data.get("access_token")
    if not access_token:
        return None, None

    # Search album
    query = f"{album_title} artist:{album_artist}"
    encoded_query = urllib.parse.quote(query)
    conn = http.client.HTTPSConnection("api.spotify.com")
    conn.request("GET", f"/v1/search?q={encoded_query}&type=album&limit=1",
                 headers={"Authorization": f"Bearer {access_token}"})
    search_data = json.loads(conn.getresponse().read())

    items = search_data.get("albums", {}).get("items", [])
    if items:
        album_info = items[0]
        return album_info["images"][0]["url"], album_info["external_urls"]["spotify"]
    return None, None
