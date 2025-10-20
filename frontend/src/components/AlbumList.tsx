import React, { useEffect, useState } from "react";
import { getAlbums, Album } from "../services/api";

export default function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [popup, setPopup] = useState<{ title: string; just: string } | null>(null);

  useEffect(() => {
    getAlbums().then(setAlbums).catch(console.error);
  }, []);

  const handleDelete = async (id: number) => {
  const password = prompt("Enter password to delete album:");
  if (!password) return;

  const res = await fetch(`http://127.0.0.1:5000/api/albums/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (res.status === 403) {
    alert("Incorrect password.");
    return;
  }

  setAlbums((prev) => prev.filter((a) => a.id !== id));
};


  return (
    <div className="container" style={{ width: "80%", margin: "50px auto", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
      <h1 style={{ color: "#4caf50", textAlign: "center" }}>Album List</h1>
      <center><p>Click on an album to view more details.</p></center>

      {albums.map((album) => (
        <div
          key={album.id}
          onClick={() => setPopup(album)}
          style={{
            backgroundColor: "#f9f9f9",
            margin: "10px 0",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={album.cover_url || "https://via.placeholder.com/50"}
              alt="cover"
              style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "15px" }}
            />
            <div>
              <strong>{album.title}</strong> by {album.artist}
              <div>Genre: {album.genre}</div>
              <div>Rating: {album.rating} (Rated by {album.rater})</div>
            </div>
          </div>

          <div>
            <button
              style={{
                border: "2px solid #ff4d4d",
                borderRadius: "50%",
                color: "#ff4d4d",
                background: "none",
                width: "32px",
                height: "32px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(album.id);
              }}
            >
              -
            </button>

            {album.spotify_url && (
              <a
                href={album.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  border: "2px solid #4caf50",
                  borderRadius: "50%",
                  color: "#4caf50",
                  marginLeft: "10px",
                  padding: "3px 8px",
                  textDecoration: "none",
                }}
              >
                ▶
              </a>
            )}
          </div>
        </div>
      ))}

      {popup && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setPopup(null)}
          ></div>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          >
            <h2>{popup.title}</h2>
            <p>{popup.just}</p>
            <button onClick={() => setPopup(null)}>Close</button>
          </div>
        </>
      )}
    </div>
  );
}
