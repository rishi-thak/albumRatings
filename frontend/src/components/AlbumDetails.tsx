import React, { useState, useEffect, useRef } from "react";
import { addAlbum, Album } from "../services/api";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function AlbumDetails() {
  const [album, setAlbum] = useState({
    title: "",
    artist: "",
    genre: "",
    rating: "",
    rater: "",
    just: "",
    cover_url: "",
    spotify_url: "",
  });

  const [accessToken, setAccessToken] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const suggestionRef = useRef<HTMLUListElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { numAlbums } = useParams();
  const [addedCount, setAddedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CLIENT_ID =
    process.env.REACT_APP_SPOTIFY_CLIENT_ID || "50237c828d5c4d8e99e85b62380cf95e";
  const CLIENT_SECRET =
    process.env.REACT_APP_SPOTIFY_CLIENT_SECRET || "8cdc64dba43442eead4e3ccbbd8bda4b";

  const location = useLocation();
  const albumToEdit = location.state?.albumToEdit;

  // ✅ Pre-fill form if editing
  useEffect(() => {
    if (albumToEdit) {
      setAlbum({
        title: albumToEdit.title || "",
        artist: albumToEdit.artist || "",
        genre: albumToEdit.genre || "",
        rating: albumToEdit.rating?.toString() || "",
        rater: albumToEdit.rater || "",
        just: albumToEdit.just || "",
        cover_url: albumToEdit.cover_url || "",
        spotify_url: albumToEdit.spotify_url || "",
      });
    }
  }, [albumToEdit]);

  // ✅ Spotify Token
  useEffect(() => {
    const getAccessToken = async () => {
      try {
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
      } catch (err) {
        console.error("Failed to fetch Spotify token:", err);
      }
    };
    getAccessToken();
  }, [CLIENT_ID, CLIENT_SECRET]);

  // ✅ Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlbum({ ...album, [e.target.name]: e.target.value });
  };

  // ✅ Spotify search
  const searchAlbums = async (query: string) => {
    if (query.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`,
        { headers: { Authorization: "Bearer " + accessToken } }
      );
      const data = await res.json();
      setSuggestions(data.albums?.items || []);
    } catch (err) {
      console.error("Spotify search error:", err);
    }
  };

  // ✅ Select from Spotify dropdown
  const selectAlbum = async (albumItem: any) => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/artists/${albumItem.artists[0].id}`, {
        headers: { Authorization: "Bearer " + accessToken },
      });
      const artistData = await res.json();

      setAlbum({
        title: albumItem.name,
        artist: albumItem.artists[0].name,
        genre: artistData.genres.join(", ") || "Unknown",
        rating: "",
        rater: "",
        just: "",
        cover_url: albumItem.images[0]?.url || "",
        spotify_url: albumItem.external_urls.spotify || "",
      });

      setSuggestions([]);
    } catch (err) {
      console.error("Failed to fetch artist genres:", err);
    }
  };

  // ✅ Submit form (add or re-add)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      ...album,
      rating: Number(album.rating) || 0,
      cover_url: album.cover_url || "",
      spotify_url: album.spotify_url || "",
    };

    try {
      // --- If editing ---
      if (albumToEdit) {
        const password = prompt("Enter admin password to edit album:");
        if (!password) {
          setIsSubmitting(false);
          return toast("Edit cancelled.");
        }

        toast.loading("Updating album...", { id: "edit" });

        // 1️⃣ Delete old entry
        const deleteRes = await fetch(
          `http://127.0.0.1:8000/api/albums/${albumToEdit.id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          }
        );

        if (deleteRes.status === 403) {
          toast.dismiss("edit");
          toast.error("Incorrect password. Album not updated.");
          setIsSubmitting(false);
          return;
        }

        if (!deleteRes.ok) {
          toast.dismiss("edit");
          toast.error("Failed to delete old album.");
          setIsSubmitting(false);
          return;
        }

        // 2️⃣ Re-add updated album
        await addAlbum(payload as Album);
        queryClient.invalidateQueries({ queryKey: ["albums"] });
        toast.dismiss("edit");
        toast.success("Album updated successfully!");
        navigate("/albums");
        return;
      }

      // --- If adding new album ---
      await addAlbum(payload as Album);
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album added successfully!");
      setAddedCount((prev) => prev + 1);

      setAlbum({
        title: "",
        artist: "",
        genre: "",
        rating: "",
        rater: "",
        just: "",
        cover_url: "",
        spotify_url: "",
      });

      if (Number(numAlbums) && addedCount + 1 < Number(numAlbums)) {
        toast(`Album ${addedCount + 1} added — add the next one!`, { icon: "🎵" });
      } else {
        navigate("/albums");
      }
    } catch (err) {
      console.error("Failed to add/update album:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8 text-white tracking-tight">
          {albumToEdit ? "Edit Album" : "Add Album"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={album.title}
              onChange={handleChange}
              onKeyUp={(e) => searchAlbums((e.target as HTMLInputElement).value)}
              placeholder="Search Spotify..."
              required
              className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded focus:border-[#3b82f6] focus:outline-none text-gray-100"
            />
            {suggestions.length > 0 && (
              <ul
                ref={suggestionRef}
                className="absolute z-10 mt-1 w-full bg-[#111] border border-[#222] rounded shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((a) => (
                  <li
                    key={a.id}
                    onClick={() => selectAlbum(a)}
                    className="flex items-center px-3 py-2 hover:bg-[#1a1a1a] cursor-pointer"
                  >
                    <img
                      src={a.images[0]?.url || "https://via.placeholder.com/30"}
                      alt={a.name}
                      className="w-8 h-8 rounded mr-3"
                    />
                    <span className="text-gray-100">
                      {a.name} – {a.artists[0].name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Artist */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Artist</label>
            <input
              type="text"
              name="artist"
              value={album.artist}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded focus:border-[#3b82f6] focus:outline-none text-gray-100"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Genre</label>
            <input
              type="text"
              name="genre"
              value={album.genre}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded focus:border-[#3b82f6] focus:outline-none text-gray-100"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rating (0–10)</label>
            <input
              type="number"
              name="rating"
              value={album.rating}
              onChange={handleChange}
              min="0"
              max="10"
              step="0.5"
              className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded focus:border-[#3b82f6] focus:outline-none text-gray-100"
            />
          </div>

          {/* Rater */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              name="rater"
              value={album.rater}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded focus:border-[#3b82f6] focus:outline-none text-gray-100"
            />
          </div>

          {/* Reasoning */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Reasoning</label>
            <textarea
              name="just"
              value={album.just}
              onChange={handleChange}
              required
              className="w-full h-28 px-4 py-3 bg-[#111] border border-[#222] rounded focus:border-[#3b82f6] focus:outline-none text-gray-100 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full font-semibold py-3 rounded transition
              ${isSubmitting
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"}
            `}
          >
            {isSubmitting
              ? albumToEdit
                ? "Saving..."
                : "Submitting..."
              : albumToEdit
              ? "Save Changes"
              : "Submit Album"}
          </button>
        </form>

        <div className="text-center mt-8">
          <a href="/albums" className="text-[#3b82f6] hover:text-[#2563eb]">
            See Album List
          </a>
        </div>
      </div>
    </div>
  );
}
