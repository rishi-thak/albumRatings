import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSpotifyInfo } from "../services/api";

export default function PlayAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<any>(null);

  useEffect(() => {
    if (id) getSpotifyInfo(Number(id)).then(setAlbum);
  }, [id]);

  if (!album)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="h-12 w-12 border-4 border-sky-500 border-t-transparent animate-spin rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/albums")}
          className="mb-8 text-sm text-gray-400 hover:text-gray-200 transition"
        >
          ← Back to Albums
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Cover */}
          <div className="aspect-square bg-gray-900 border border-gray-700 rounded overflow-hidden">
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
          <div>
            <h1 className="text-5xl font-black text-white mb-3">{album.title}</h1>
            <p className="text-2xl text-gray-400 mb-6">{album.artist}</p>

            {album.rating && (
              <div className="flex items-center mb-6">
                <div className="bg-sky-500 text-black font-bold text-2xl px-5 py-3 rounded">
                  {album.rating}/10
                </div>
                {album.rater && (
                  <p className="ml-4 text-gray-400 text-sm">
                    Rated by <span className="text-gray-200">{album.rater}</span>
                  </p>
                )}
              </div>
            )}

            {album.genre && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {album.genre.split(",").map((g: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded uppercase"
                    >
                      {g.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {album.just && (
              <div className="bg-gray-900 border border-gray-800 rounded p-5 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Reasoning</p>
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{album.just}</p>
              </div>
            )}

            {album.spotify_url && (
              <a
                href={album.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 py-3 rounded"
              >
                ▶ Play on Spotify
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
