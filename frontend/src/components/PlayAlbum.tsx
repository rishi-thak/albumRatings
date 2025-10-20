import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpotifyInfo } from "../services/api";

export default function PlayAlbum() {
  const { id } = useParams();
  const [album, setAlbum] = useState<{ cover_url?: string; spotify_url?: string } | null>(null);

  useEffect(() => {
    if (id) getSpotifyInfo(Number(id)).then(setAlbum);
  }, [id]);

  if (!album) return <p>Loading...</p>;

  return (
    <div className="container" style={{ width: "80%", margin: "50px auto", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <h1 style={{ color: "#4caf50", textAlign: "center" }}>Play Album</h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src={album.cover_url || "https://via.placeholder.com/200"}
          alt="Album Cover"
          style={{ width: "200px", height: "200px", objectFit: "cover", marginBottom: "20px" }}
        />
        <button
          onClick={() => window.open(album.spotify_url, "_blank")}
          style={{ backgroundColor: "#4caf50", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px" }}
        >
          Play on Spotify
        </button>
      </div>
      <a href="/albums" style={{ textDecoration: "none", color: "#0c6fa8", display: "block", textAlign: "center", marginTop: "20px" }}>
        Back to Album List
      </a>
    </div>
  );
}
