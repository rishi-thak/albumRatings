import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlbums } from "../hooks/useAlbums";
import { getSpotifyInfo } from "../services/api";
import { Album } from "../services/api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";


// Use the same API_BASE your other services use
const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/albums";

export default function PlayAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: albums = [], isLoading, error } = useAlbums();
  const numericId = useMemo(() => Number(id), [id]);

  // local overlay to hold merged album (db + spotify fields)
  const [coverInfo, setCoverInfo] = useState<{ cover_url?: string; spotify_url?: string } | null>(
    null
  );
  const album: Album | undefined = useMemo(
    () => albums.find((a) => a.id === numericId),
    [albums, numericId]
  );

  // fetch cover/spotify links for this album id and merge
  useEffect(() => {
    if (!numericId) return;
    getSpotifyInfo(numericId)
      .then((info) => setCoverInfo(info || {}))
      .catch(() => setCoverInfo({}));
  }, [numericId]);

  const merged = useMemo(() => {
    if (!album) return null;
    return {
      ...album,
      cover_url: coverInfo?.cover_url ?? album.cover_url,
      spotify_url: coverInfo?.spotify_url ?? album.spotify_url,
    };
  }, [album, coverInfo]);

  const verifyPasswordForEdit = async (): Promise<boolean> => {
    const password = prompt("Enter admin password to edit:");
    if (!password) return false;

    try {
      // Safe no-op verification: try deleting id 0 (doesn't exist)
      const res = await fetch(`${API_BASE}/0`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.status === 403) {
        toast.error("Incorrect admin password.");
        return false;
      }
      if (!res.ok) {
        toast.error("Password verification failed.");
        return false;
      }

      // pass the password forward if you ever want to reuse it
      return true;
    } catch {
      toast.error("Network error verifying password.");
      return false;
    }
  };

  const handleEdit = async () => {
    if (!merged) return;
    const ok = await verifyPasswordForEdit();
    if (!ok) return;
    toast.success("Access granted.");
    // navigate with album data so AlbumDetails can prefill
    navigate("/add/1", { state: { albumToEdit: merged } });
  };

  const queryClient = useQueryClient();
  const handleDelete = async () => {
  if (!numericId) return;
  const password = prompt("Enter admin password to delete:");
  if (!password) return;

  try {
    toast.loading("Deleting album...", { id: "del" });
    const res = await fetch(`${API_BASE}/${numericId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.status === 403) {
      toast.dismiss("del");
      toast.error("Incorrect admin password.");
      return;
    }
    if (!res.ok) {
      toast.dismiss("del");
      toast.error("Failed to delete album.");
      return;
    }

    toast.dismiss("del");
    toast.success("Album deleted.");

    // ✅ Invalidate React Query cache so album list refetches
    queryClient.invalidateQueries({ queryKey: ["albums"] });

    // Optionally, navigate after cache refresh
    navigate("/albums");
  } catch (e) {
    toast.dismiss("del");
    toast.error("Network error deleting album.");
  }
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="h-12 w-12 border-4 border-[#3b82f6] border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (error || !merged) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-300 flex flex-col items-center justify-center">
        <p className="mb-4">{error ? "Failed to load album." : "Album not found."}</p>
        <button
          onClick={() => navigate("/albums")}
          className="px-4 py-2 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white"
        >
          Back to Albums
        </button>
      </div>
    );
  }

  // rating badge color
  const rating = Number(merged.rating);
  const ratingColor =
    Number.isFinite(rating) && rating >= 0
      ? rating >= 9
        ? "bg-emerald-500"
        : rating >= 7
        ? "bg-blue-500"
        : rating >= 5
        ? "bg-amber-500"
        : "bg-red-500"
      : "bg-gray-600";

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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        {/* Cover */}
        <div className="aspect-square bg-[#111] border border-[#222] overflow-hidden">
          {merged.cover_url ? (
            <img src={merged.cover_url} alt={merged.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-600 text-7xl">
              ♪
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-8">
          {/* Title / Artist */}
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
              {merged.title}
            </h1>
            <p className="text-2xl text-gray-400">{merged.artist}</p>
          </div>

          {/* Rating + Rater */}
          {Number.isFinite(rating) && (
            <div className="flex items-center gap-4">
              <div className={`${ratingColor} px-6 py-3 inline-block`}>
                <span className="text-3xl font-black text-white">{rating}</span>
                <span className="text-white text-lg font-bold ml-1">/10</span>
              </div>
              {merged.rater && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Rated by</p>
                  <p className="text-white font-medium text-lg">{merged.rater}</p>
                </div>
              )}
            </div>
          )}

          {/* Genre tags */}
          {merged.genre && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Genre</p>
              <div className="flex flex-wrap gap-2">
                {String(merged.genre)
                  .split(",")
                  .map((g, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-[#111] border border-[#222] text-gray-300 font-medium uppercase tracking-wider text-sm"
                    >
                      {g.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Reasoning box */}
          {merged.just && (
            <div className="bg-[#111] border border-[#222] p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Reasoning</p>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">{merged.just}</p>
            </div>
          )}

          {/* Spotify button */}
          {merged.spotify_url && (
            <a href={merged.spotify_url} target="_blank" rel="noopener noreferrer" className="block">
              <button className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-4 rounded transition">
                ▶ PLAY ON SPOTIFY
              </button>
            </a>
          )}

          {/* Actions */}
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
