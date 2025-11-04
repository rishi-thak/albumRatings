import React, { useState, useEffect, useRef } from "react";
import { addAlbum, Album } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { numAlbums } = useParams();
  const [addedCount, setAddedCount] = useState(0);

  const CLIENT_ID =
    process.env.REACT_APP_SPOTIFY_CLIENT_ID || "50237c828d5c4d8e99e85b62380cf95e";
  const CLIENT_SECRET =
    process.env.REACT_APP_SPOTIFY_CLIENT_SECRET || "8cdc64dba43442eead4e3ccbbd8bda4b";

  // Spotify Token
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

  // Hide dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node))
        setSuggestions([]);
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

    // fetch artist genres
    const res = await fetch(`https://api.spotify.com/v1/artists/${albumItem.artists[0].id}`, {
      headers: { Authorization: "Bearer " + accessToken },
    });
    const artistData = await res.json();
    setAlbum((prev) => ({ ...prev, genre: artistData.genres.join(", ") || "Unknown" }));
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAlbum: Album = await addAlbum({ ...album, rating: Number(album.rating) });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      setAlbum({ title: "", artist: "", genre: "", rating: "", rater: "", just: "" });
      setAddedCount((prev) => prev + 1);

      if (Number(numAlbums) && addedCount + 1 < Number(numAlbums)) {
        alert(`Album ${addedCount + 1} added! Add the next one.`);
      } else {
        alert("All albums added!");
        navigate("/albums");
      }
    } catch (err) {
      console.error("Failed to add album:", err);
      alert("Failed to add album. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8 text-white tracking-tight">
          Add Album ({addedCount + 1}/{numAlbums || 1})
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:border-sky-500 focus:outline-none text-gray-100"
            />
            {suggestions.length > 0 && (
              <ul
                ref={suggestionRef}
                className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((a) => (
                  <li
                    key={a.id}
                    onClick={() => selectAlbum(a)}
                    className="flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:border-sky-500 focus:outline-none text-gray-100"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:border-sky-500 focus:outline-none text-gray-100"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:border-sky-500 focus:outline-none text-gray-100"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:border-sky-500 focus:outline-none text-gray-100"
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
              className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:border-sky-500 focus:outline-none text-gray-100 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded"
          >
            Submit Album
          </button>
        </form>

        <div className="text-center mt-8">
          <a href="/albums" className="text-sky-400 hover:text-sky-300">
            See Album List
          </a>
        </div>
      </div>
    </div>
  );
}
