import React, { useState, useEffect, useRef } from "react";
import { addAlbum } from "../services/api";

export default function AlbumDetails() {
  const [album, setAlbum] = useState({
    title: "",
    artist: "",
    genre: "",
    rating: "",
    rater: "",
    just: "",
  });

  const [accessToken, setAccessToken] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const suggestionRef = useRef<HTMLUListElement>(null);

  const CLIENT_ID = "50237c828d5c4d8e99e85b62380cf95e";
  const CLIENT_SECRET = "8cdc64dba43442eead4e3ccbbd8bda4b";

  // --- Spotify token ---
  useEffect(() => {
    const getAccessToken = async () => {
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        },
        body: "grant_type=client_credentials",
      });
      const data = await res.json();
      setAccessToken(data.access_token);
    };
    getAccessToken();
  }, []);

  // --- Click outside hides dropdown ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlbum({ ...album, [e.target.name]: e.target.value });
  };

  const searchAlbums = async (query: string) => {
    if (query.length < 2) return setSuggestions([]);
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`,
      { headers: { Authorization: "Bearer " + accessToken } }
    );
    const data = await res.json();
    setSuggestions(data.albums?.items || []);
  };

  const selectAlbum = async (albumItem: any) => {
    setAlbum({
      ...album,
      title: albumItem.name,
      artist: albumItem.artists[0].name,
      genre: "",
      rating: "",
      rater: "",
      just: "",
    });

    // Fetch artist genres
    const res = await fetch(`https://api.spotify.com/v1/artists/${albumItem.artists[0].id}`, {
      headers: { Authorization: "Bearer " + accessToken },
    });
    const artistData = await res.json();
    setAlbum((prev) => ({
      ...prev,
      genre: artistData.genres.join(", ") || "Unknown",
    }));
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAlbum({ ...album, rating: Number(album.rating) });
    setAlbum({ title: "", artist: "", genre: "", rating: "", rater: "", just: "" });
  };

  return (
    <div
      className="container"
      style={{
        width: "60%",
        margin: "50px auto",
        backgroundColor: "#fff",
        padding: "30px 40px",
        borderRadius: "10px",
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ color: "#4caf50", textAlign: "center", fontSize: "2rem", marginBottom: "25px" }}>
        Enter Album Details
      </h1>

      <form onSubmit={handleSubmit}>
        {/* TITLE */}
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <label style={{ display: "block", fontSize: "1rem", marginBottom: "6px", color: "#555" }}>
            Title:
          </label>
          <input
            type="text"
            name="title"
            value={album.title}
            onChange={handleChange}
            onKeyUp={(e) => searchAlbums((e.target as HTMLInputElement).value)}
            placeholder="Type to search Spotify..."
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
          {suggestions.length > 0 && (
            <ul
              ref={suggestionRef}
              style={{
                position: "absolute",
                background: "white",
                border: "1px solid #ddd",
                listStyle: "none",
                margin: "4px 0 0 0",
                padding: 0,
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                borderRadius: "6px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
              }}
            >
              {suggestions.map((a) => (
                <li
                  key={a.id}
                  onClick={() => selectAlbum(a)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <img
                    src={a.images[0]?.url || "https://via.placeholder.com/30"}
                    alt={a.name}
                    style={{ width: "35px", height: "35px", borderRadius: "4px", marginRight: "10px" }}
                  />
                  <span style={{ fontSize: "0.95rem" }}>
                    {a.name} – {a.artists[0].name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* OTHER FIELDS */}
        {["artist", "genre", "rating", "rater"].map((field) => (
          <div key={field} style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "1rem", marginBottom: "6px", color: "#555" }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              type="text"
              name={field}
              value={(album as any)[field]}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "1rem", marginBottom: "6px", color: "#555" }}>
            Reasoning:
          </label>
          <textarea
            name="just"
            value={album.just}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              height: "100px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#0c6fa8",
            color: "white",
            fontSize: "1rem",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Submit Album
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <a href="/albums" style={{ color: "#0c6fa8", textDecoration: "none", fontSize: "1rem" }}>
          See Album List
        </a>
      </div>
    </div>
  );
}
