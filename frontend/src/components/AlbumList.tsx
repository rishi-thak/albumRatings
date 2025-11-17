import React, { useState } from "react";
import { useAlbums } from "../hooks/useAlbums";
import AlbumCard from "./AlbumCard";
import { Grid3X3 } from "lucide-react";

export default function AlbumList() {
  const { data: albums = [], isLoading, error } = useAlbums();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [gridMode, setGridMode] = useState<"compact" | "default" | "spacious">("default");

  const filtered = albums
    .filter((album) => {
      const q = searchQuery.toLowerCase();
      return (
        album.title.toLowerCase().includes(q) ||
        album.artist.toLowerCase().includes(q) ||
        album.genre.toLowerCase().includes(q) ||
        album.rater.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "artist") return a.artist.localeCompare(b.artist);
      if (sortBy === "time") return (b.id || 0) - (a.id || 0);
      return 0;
    });

  // Dynamic grid styles
  const gridClass =
    gridMode === "compact"
      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      : gridMode === "spacious"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6";

  const cycleGridMode = () => {
    setGridMode((prev) =>
      prev === "default" ? "compact" : prev === "compact" ? "spacious" : "default"
    );
  };

  const gridLabel =
    gridMode === "compact" ? "Compact view" : gridMode === "spacious" ? "Spacious view" : "Default view";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
              ALBUMS
            </h1>
            <p className="text-gray-400">
              {filtered.length} {filtered.length === 1 ? "album" : "albums"}
            </p>
          </div>

          {/* Search, Sort, Grid Toggle */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-start md:items-center">
            <input
              type="text"
              placeholder="Search albums, artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-sky-500"
            />
            {/* Sort Dropdown with arrow */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="
                    appearance-none
                    w-full
                    bg-gray-900
                    border border-gray-700
                    text-gray-100
                    text-sm
                    px-4
                    py-2.5
                    pr-10
                    rounded-md
                    cursor-pointer
                    focus:outline-none
                    focus:ring-2 focus:ring-sky-500
                    focus:border-sky-500
                    hover:border-gray-500
                    transition
                    duration-150
                  "
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="title">Sort by Title</option>
                  <option value="artist">Sort by Artist</option>
                  <option value="time">Sort by Recency</option>
                </select>

                {/* ▼ arrow icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>



            {/* Grid toggle */}
            <button
              onClick={cycleGridMode}
              title={gridLabel}
              className="p-2 border border-gray-700 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition flex items-center justify-center"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-12 w-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-400">Failed to load albums.</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-4">
              {searchQuery ? "No albums found." : "No albums yet."}
            </p>
            {!searchQuery && (
              <a
                href="/add/1"
                className="inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded font-semibold"
              >
                Add your first album
              </a>
            )}
          </div>
        ) : (
          <div className={gridClass}>
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
