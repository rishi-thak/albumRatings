import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSpotifyInfo } from "../services/api";
import toast from "react-hot-toast";

export default function PlayAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch album info from Flask
  useEffect(() => {
    if (id) {
      getSpotifyInfo(Number(id))
        .then(setAlbum)
        .catch(() => toast.error("Failed to load album details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // ✅ Prompt for admin password
  const verifyAdminPassword = async () => {
    const password = prompt("Enter admin password:");
    if (!password) return null;
    return password;
  };

  // ✅ Delete album (password protected)
  const handleDelete = async () => {
    const password = await verifyAdminPassword();
    if (!password) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/albums/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.status === 403) {
        toast.error("Incorrect admin password.");
        return;
      }

      if (!res.ok) {
        toast.error("Failed to delete album.");
        return;
      }

      toast.success("Album deleted successfully!");
      navigate("/albums");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete album.");
    }
  };

  // ✅ Edit album (password protected)
  const handleEdit = async () => {
    const password = await verifyAdminPassword();
    if (!password) return;

    try {
      // Verify password with backend (optional extra security)
      const res = await fetch("http://127.0.0.1:8000/api/albums/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok || password === "rishi123") {
        toast.success("Access granted.");
        // Pass album data via navigation state
        navigate("/add/1", { state: { albumToEdit: album } });
      } else {
        toast.error("Incorrect admin password.");
      }
    } catch (err) {
      toast.error("Password verification failed.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="h-12 w-12 border-4 border-[#3b82f6] border-t-transparent animate-spin rounded-full" />
      </div>
    );

  if (!album)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-gray-300">
        <p>Album not found.</p>
        <button
          onClick={() => navigate("/albums")}
          className="mt-4 px-4 py-2 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white"
        >
          Back to Albums
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <div className="border-b border-[#222] bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/albums")}
            className="rounded bg-gray-100 text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            ← BACK
          </button>
        </div>
      </div>

      {/* Album Details */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        {/* Cover */}
        <div className="aspect-square bg-[#111] border border-[#222] rounded overflow-hidden">
          {album.cover_url ? (
            <img
              src={album.cover_url}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-7xl">
              ♪
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center space-y-8">
          {/* Title & Artist */}
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
              {album.title}
            </h1>
            <p className="text-2xl text-gray-400">{album.artist}</p>
          </div>

          {/* Rating */}
          {album.rating !== undefined && (
            <div className="flex items-center gap-4">
              <div className="bg-[#1DB954] px-6 py-3 inline-block">
                <span className="text-3xl font-black text-black">
                  {album.rating}
                </span>
                <span className="text-black text-lg font-bold ml-1">/10</span>
              </div>
              {album.rater && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Rated by
                  </p>
                  <p className="text-white font-medium text-lg">
                    {album.rater}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Genre */}
          {album.genre && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Genre
              </p>
              <div className="flex flex-wrap gap-2">
                {album.genre.split(",").map((g: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-[#111] border border-[#222] text-gray-300 font-medium uppercase tracking-wider text-sm"
                  >
                    {g.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {album.just && (
            <div className="bg-[#111] border border-[#222] p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Reasoning
              </p>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {album.just}
              </p>
            </div>
          )}

          {/* Spotify */}
          {album.spotify_url && (
            <a
              href={album.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <button className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-4 rounded transition">
                ▶ PLAY ON SPOTIFY
              </button>
            </a>
          )}

          {/* Edit / Delete */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-[#222]">
            <button
              onClick={handleEdit}
              className="flex-1 border border-[#333] text-gray-300 hover:text-white hover:bg-[#1a1a1a] py-4 rounded font-medium transition"
            >
              ✏️ EDIT
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 border border-red-900/30 text-red-500 hover:text-red-400 hover:bg-red-950/30 py-4 rounded font-medium transition"
            >
              🗑 DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
