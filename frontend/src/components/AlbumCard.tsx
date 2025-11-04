import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export default function AlbumCard({ album }: { album: any }) {
  const getRatingColor = (rating: number) => {
    if (rating >= 9) return "bg-emerald-500";
    if (rating >= 7) return "bg-sky-500";
    if (rating >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="group relative rounded-lg overflow-hidden border border-gray-700 bg-gray-900 hover:border-sky-500 transition-all">
      <Link to={`/play/${album.id}`}>
        {/* Cover */}
        <div className="aspect-square relative overflow-hidden bg-gray-800">
          {album.cover_url ? (
            <img
              src={album.cover_url}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-600 text-5xl">
              ♪
            </div>
          )}

          {album.rating && (
            <div
              className={`absolute top-3 right-3 ${getRatingColor(
                album.rating
              )} text-white text-sm font-semibold px-3 py-1 rounded`}
            >
              {album.rating}/10
            </div>
          )}

          {album.spotify_url && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={album.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1DB954] hover:bg-[#1ed760] p-4 rounded-full transition-transform hover:scale-110"
              >
                <Play className="w-6 h-6 text-black fill-black" />
              </a>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-gray-100 font-bold text-lg mb-1 line-clamp-1 group-hover:text-sky-400 transition-colors">
            {album.title}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-1">{album.artist}</p>

          {album.genre && (
            <div className="flex flex-wrap gap-2 mb-3">
              {album.genre
                .split(",")
                .slice(0, 3)
                .map((g: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs uppercase tracking-wider text-gray-400 bg-gray-800 border border-gray-700 px-2 py-1 rounded"
                  >
                    {g.trim()}
                  </span>
                ))}
            </div>
          )}

          {album.rater && (
            <p className="text-xs text-gray-500">
              Rated by <span className="font-medium text-gray-300">{album.rater}</span>
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
