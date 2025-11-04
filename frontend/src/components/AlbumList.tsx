import React, { useState } from "react";
import { useAlbums } from "../hooks/useAlbums";
import AlbumCard from "./AlbumCard";

export default function AlbumList() {
  const { data: albums = [], isLoading, error } = useAlbums();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

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
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                ALBUMS
              </h1>
              <p className="text-gray-400">
                {filtered.length} {filtered.length === 1 ? "album" : "albums"}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search albums, artists, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-sky-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-sky-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="title">Sort by Title</option>
                <option value="artist">Sort by Artist</option>
              </select>
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
