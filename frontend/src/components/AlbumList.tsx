import React, { useState, useEffect } from "react";
import { useAlbums } from "../hooks/useAlbums";
import { Album } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

export default function AlbumList() {
  const { data: albums, isLoading, error } = useAlbums();
  const queryClient = useQueryClient();
  const [popup, setPopup] = useState<{ title: string; just: string } | null>(null);
  const [loadingText, setLoadingText] = useState("loading.");

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/albums";

  // Animate the "loading." → "loading.." → "loading..." text
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === "loading.") return "loading..";
        if (prev === "loading..") return "loading...";
        return "loading.";
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // ✅ Delete album and update cache
  const handleDelete = async (id: number) => {
    const password = prompt("Enter password to delete album:");
    if (!password) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.status === 403) {
      alert("Incorrect password.");
      return;
    }

    queryClient.setQueryData<Album[]>(["albums"], (oldAlbums) =>
      oldAlbums ? oldAlbums.filter((a) => a.id !== id) : []
    );
  };

  // ✅ Render main container regardless of loading state
  return (
    <div
      className="container"
      style={{
        width: "80%",
        margin: "50px auto",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        minHeight: "300px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <h1 style={{ color: "#4caf50", textAlign: "center" }}>Album List</h1>
      <center>
        <p>Click on an album to view more details.</p>
      </center>

      {/* Loading Spinner */}
      {isLoading && (
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "1.5rem",
            color: "#0c6fa8",
            animation: "fade 1s ease-in-out infinite",
          }}
        >
          {loadingText}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && <p style={{ textAlign: "center" }}>Failed to load albums.</p>}

      {/* Albums List */}
      {!isLoading && albums && albums.length > 0 && (
        <>
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
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    marginRight: "15px",
                  }}
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
        </>
      )}

      {/* No Albums */}
      {!isLoading && albums && albums.length === 0 && (
        <p style={{ textAlign: "center" }}>No albums found.</p>
      )}

      {popup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setPopup(null)} // closes only when you click *outside*
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              maxWidth: "500px",
              width: "90%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // ⛔ stop click from bubbling up
          >
            <h2>{popup.title}</h2>
            <p>{popup.just}</p>
            <button
              style={{
                marginTop: "10px",
                background: "#0c6fa8",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setPopup(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
