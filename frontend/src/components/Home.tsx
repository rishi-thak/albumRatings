import React from "react";
import { useAlbums } from "../hooks/useAlbums";
import { Link } from "react-router-dom";

/**
 * Dashboard home:
 * - Stats: total, average rating, highest rated
 * - Recently added: last 8 items (we take from end of array to avoid schema changes)
 * - Quick actions
 * - All styling via Tailwind; no backend changes
 */
export default function Home() {
  const { data: albums = [], isLoading, error } = useAlbums();

  // ratings safely parsed to numbers
  const numericRatings = albums
    .map((a) => Number(a.rating))
    .filter((n) => !Number.isNaN(n));

  const totalAlbums = albums.length;
  const averageRating =
    numericRatings.length > 0
      ? (numericRatings.reduce((s, n) => s + n, 0) / numericRatings.length).toFixed(1)
      : "0.0";

  const highestRated =
    numericRatings.length > 0 ? Math.max(...numericRatings).toFixed(1) : null;

  // Recently added: take the last 8 from the array (no schema change)
  const recentlyAdded = albums.slice(-8).reverse();

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                Rishi's<br />Records
              </h1>
              <p className="mt-4 text-gray-400 text-lg">
                Your personal music collection and ratings
              </p>
            </div>
            <Link
              to="/add/1"
              className="inline-flex items-center rounded bg-accent px-6 py-4 text-white font-bold hover:bg-[#2563eb] transition"
            >
              +&nbsp;ADD ALBUM
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border p-8 hover:border-[#333] transition-colors">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Total Albums</p>
            <p className="text-5xl font-black text-white">{isLoading ? "…" : totalAlbums}</p>
          </div>
          <div className="bg-surface border border-border p-8 hover:border-[#333] transition-colors">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Average Rating</p>
            <p className="text-5xl font-black text-white">{isLoading ? "…" : averageRating}</p>
          </div>
          <div className="bg-surface border border-border p-8 hover:border-[#333] transition-colors">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Highest Rated</p>
            <p className="text-5xl font-black text-white">
              {isLoading ? "…" : highestRated ? `${highestRated}/10` : "N/A"}
            </p>
          </div>
        </div>

        {/* Recently Added */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">RECENTLY ADDED</h2>
              <p className="text-gray-500">Your latest album additions</p>
            </div>
            <Link
              to="/albums"
              className="rounded border border-[#333] px-4 py-2 text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="bg-surface border border-border p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : error ? (
              <p className="text-center text-gray-400 py-16">Failed to load albums.</p>
            ) : recentlyAdded.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">🎵</div>
                <p className="text-gray-400">No albums yet</p>
                <Link
                  to="/add/1"
                  className="mt-6 inline-flex rounded bg-accent px-4 py-2 font-semibold text-white hover:bg-[#2563eb] transition"
                >
                  Add your first album
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentlyAdded.map((a) => (
                  <Link
                    key={a.id}
                    to={`/play/${a.id}`}
                    className="group bg-[#111] border border-border hover:border-accent transition-colors"
                  >
                    <div className="aspect-square bg-[#1a1a1a] overflow-hidden">
                      {a.cover_url ? (
                        <img
                          src={a.cover_url}
                          alt={a.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-600">
                          <span className="text-6xl">♪</span>
                        </div>
                      )}
                      {a.rating !== undefined && a.rating !== null && a.rating !== ("" as any) && (
                        <div className="absolute right-3 top-3 rounded bg-spotify px-3 py-1 text-sm font-bold text-black">
                          {a.rating}/10
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-accent transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-1">{a.artist}</p>

                      {a.genre && (
                        <div className="flex flex-wrap gap-2">
                          {String(a.genre)
                            .split(",")
                            .slice(0, 3)
                            .map((g, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 border border-[#333] bg-[#1a1a1a]"
                              >
                                {g.trim()}
                              </span>
                            ))}
                        </div>
                      )}

                      {a.rater && (
                        <p className="mt-3 text-xs text-gray-500">
                          Rated by <span className="font-medium text-gray-300">{a.rater}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid md:grid-cols-2 gap-6">
          <Link to="/albums" className="group">
            <div className="bg-surface border border-border p-8 transition-all hover:border-accent">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                Browse All Albums
              </h3>
              <p className="text-gray-500">View and manage your complete album collection</p>
            </div>
          </Link>

          <Link to="/add/1" className="group">
            <div className="bg-surface border border-border p-8 transition-all hover:border-accent">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                Add New Album
              </h3>
              <p className="text-gray-500">Rate and add a new album to your collection</p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
