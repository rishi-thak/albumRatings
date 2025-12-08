import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlbums } from "../hooks/useAlbums";
import { getSpotifyInfo } from "../services/api";
import { Album } from "../services/api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";


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

  // Create a derived list of ALL reviews for this album
  const relatedReviews = useMemo(() => {
    if (!album || !albums) return [];

    // Normalize helper: lowercase + remove accents
    const normalize = (s: string) =>
      s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const keyTitle = normalize(album.title);
    const keyArtist = normalize(album.artist);

    return albums.filter(
      (a) =>
        normalize(a.title) === keyTitle &&
        normalize(a.artist) === keyArtist
    );
  }, [album, albums]);

  // Cleanup toasts on unmount to prevent "zombie" popups
  useEffect(() => {
    return () => {
      toast.dismiss("selection-toast");
    };
  }, []);



  const merged = useMemo(() => {
    if (!album) return null;
    return {
      ...album,
      cover_url: coverInfo?.cover_url ?? album.cover_url,
      spotify_url: coverInfo?.spotify_url ?? album.spotify_url,
    };
  }, [album, coverInfo]);

  // Carousel State
  const [reviewIndex, setReviewIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Ensure index is valid when reviews change
  useEffect(() => {
    if (reviewIndex >= relatedReviews.length) {
      setReviewIndex(0);
    }
  }, [relatedReviews, reviewIndex]);

  const currentReview = relatedReviews[reviewIndex];

  // Carousel Navigation
  const handlePrevReview = () => {
    setDirection(-1);
    setReviewIndex((prev) => (prev === 0 ? relatedReviews.length - 1 : prev - 1));
  };
  const handleNextReview = () => {
    setDirection(1);
    setReviewIndex((prev) => (prev === relatedReviews.length - 1 ? 0 : prev + 1));
  };

  // Animation Variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Calculate Average Rating
  const averageRating = useMemo(() => {
    if (relatedReviews.length === 0) return 0;
    const sum = relatedReviews.reduce((acc, curr) => acc + Number(curr.rating), 0);
    return sum / relatedReviews.length;
  }, [relatedReviews]);

  // Rater list
  const ratersList = useMemo(() => {
    const raters = Array.from(new Set(relatedReviews.map((r) => r.rater)));
    if (raters.length > 3) {
      return `${raters.slice(0, 3).join(", ")} + ${raters.length - 3} more`;
    }
    return raters.join(", ");
  }, [relatedReviews]);

  // Helper to select an entry for Edit/Delete using a custom Toast
  const selectEntry = (action: "edit" | "delete"): Promise<Album | null> => {
    if (relatedReviews.length === 1) return Promise.resolve(relatedReviews[0]);

    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="bg-[#111] border border-[#333] p-4 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-white font-bold mb-3">Which entry to {action}?</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {relatedReviews.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(r);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[#222] text-gray-300 transition flex justify-between items-center group"
                >
                  <span className="font-medium group-hover:text-white transition-colors">{r.rater}</span>
                  <span
                    className={`${getRatingColor(
                      r.rating
                    )} text-xs px-2 py-0.5 rounded text-white font-bold ml-2`}
                  >
                    {r.rating}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(null);
              }}
              className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-white transition uppercase tracking-wider font-medium border-t border-[#222]"
            >
              Cancel
            </button>
          </div>
        ),
        { duration: Infinity, id: "selection-toast" }
      );
    });
  };

  const handleEdit = async () => {
    if (!merged) return;

    // 1. Auth First
    const ok = await verifyPasswordForEdit();
    if (!ok) return;

    // 2. Select Entry (Visual Popup)
    const targetAlbum = await selectEntry("edit");
    if (!targetAlbum) return;

    // Merge spotify info for the edit page
    const fullTarget = {
      ...targetAlbum,
      cover_url: targetAlbum.cover_url || merged.cover_url,
      spotify_url: targetAlbum.spotify_url || merged.spotify_url,
    };

    toast.success("Access granted.");
    navigate(`/add/1`, { state: { albumToEdit: fullTarget } });
  };

  const queryClient = useQueryClient();
  const handleDelete = async () => {
    // 1. Prompt Password
    const passwordInput = prompt("Enter admin password to delete:");
    if (!passwordInput) return;

    // 2. Verify Password (using a dummy delete call)
    try {
      const checkRes = await fetch(`${API_BASE}/0`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (checkRes.status === 403) {
        toast.error("Incorrect admin password.");
        return;
      }
      // If checkRes.ok is false for other reasons (e.g., server error),
      // we'll let the actual delete call handle it or just proceed.
      // For now, only explicit 403 is a pre-check failure.
    } catch {
      // Network error during password check, proceed cautiously or inform user.
      // For now, we'll let the main delete catch block handle network issues.
    }

    // 3. Select Entry
    const targetAlbum = await selectEntry("delete");
    if (!targetAlbum) return;

    // 4. Execute Delete
    try {
      toast.loading("Deleting review...", { id: "del" });
      const res = await fetch(`${API_BASE}/${targetAlbum.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (res.status === 403) {
        toast.dismiss("del");
        toast.error("Incorrect admin password.");
        return;
      }
      if (!res.ok) {
        toast.dismiss("del");
        toast.error("Failed to delete review.");
        return;
      }

      toast.dismiss("del");
      toast.success("Review deleted.");

      // ✅ Invalidate React Query cache so album list refetches
      queryClient.invalidateQueries({ queryKey: ["albums"] });

      // If it was the last review, go back. If not, stay here (auto-update via cache)
      if (relatedReviews.length <= 1) {
        navigate("/albums");
      }
    } catch (e) {
      toast.dismiss("del");
      toast.error("Network error deleting review.");
    }
  };

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


  // rating badge color helper
  const getRatingColor = (r: number) => {
    if (r >= 9) return "bg-emerald-500";
    if (r >= 7) return "bg-sky-500";
    if (r >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  const avgRatingColor = getRatingColor(averageRating);

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <div className="border-b border-[#222] bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/")}
            className="rounded bg-gray-100 text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            ← BACK
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        {/* Cover */}
        <div className="space-y-6">
          <div className="aspect-square bg-[#111] border border-[#222] overflow-hidden rounded-lg shadow-2xl">
            {merged.cover_url ? (
              <img src={merged.cover_url} alt={merged.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-600 text-7xl">
                ♪
              </div>
            )}
          </div>

          {/* Spotify button */}
          {merged.spotify_url && (
            <div className="space-y-4">
              <a href={merged.spotify_url} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-4 rounded transition flex items-center justify-center gap-2">
                  <span>PLAY ON SPOTIFY</span>
                </button>
              </a>

              <button
                onClick={() => navigate("/add/1", { state: { prefillAlbum: merged } })}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-4 rounded transition flex items-center justify-center gap-2"
              >
                <span>RATE THIS ALBUM</span>
              </button>
            </div>
          )}
        </div>

        {/* Info & Reviews */}
        <div className="flex flex-col h-full">
          {/* Header Info */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight leading-none">
              {merged.title}
            </h1>
            <p className="text-2xl text-gray-400 font-light">{merged.artist}</p>
          </div>

          {/* Average Rating Block */}
          <div className="flex items-center gap-6 mb-8">
            <div className={`${avgRatingColor} px-6 py-3 rounded-lg shadow-lg`}>
              <span className="text-4xl font-black text-white">
                {averageRating % 1 === 0 ? averageRating : averageRating.toFixed(1)}
              </span>
              <span className="text-white/80 text-xl font-bold ml-1">/10</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rated by</p>
              <p className="text-white font-medium text-lg leading-tight">
                {ratersList}
              </p>
            </div>
          </div>

          {/* Genre tags */}
          {merged.genre && (
            <div className="mb-10">
              <div className="flex flex-wrap gap-2">
                {String(merged.genre)
                  .split(",")
                  .map((g, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs font-medium uppercase tracking-wider rounded"
                    >
                      {g.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Reviews Carousel */}
          <div className="flex-1 flex flex-col pt-6 border-t border-[#222]">
            {currentReview ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider font-bold flex items-center gap-2">
                    REASONING
                    {relatedReviews.length > 1 && (
                      <>
                        - BY <span className="text-sky-500">{currentReview.rater.toUpperCase()}</span>
                      </>
                    )}
                  </h3>
                  {relatedReviews.length > 1 && (
                    <span className={`text-xs font-bold px-3 py-1 rounded ${getRatingColor(currentReview.rating)} text-white`}>
                      Rated {currentReview.rating}/10
                    </span>
                  )}
                </div>

                <div className="flex-1 relative overflow-hidden mb-6">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={reviewIndex}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      className="h-full bg-[#111] border border-[#222] p-6 rounded-lg relative"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                      <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                          {currentReview.just || <span className="italic text-gray-600">No written justification.</span>}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Carousel Controls */}
                {relatedReviews.length > 1 && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={handlePrevReview}
                      className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition"
                      title="Previous Review"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <span className="text-sm text-gray-500 font-medium">
                      {reviewIndex + 1} / {relatedReviews.length}
                    </span>
                    <button
                      onClick={handleNextReview}
                      className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition"
                      title="Next Review"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">No reviews loaded.</p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-auto">
              <button
                onClick={handleEdit}
                className="flex-1 border border-[#333] text-gray-300 hover:text-white hover:bg-[#1a1a1a] py-4 rounded font-medium transition"
              >
                ✏️ EDIT ENTRY
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 border border-red-900/30 text-red-500 hover:text-red-400 hover:bg-red-950/30 py-4 rounded font-medium transition"
              >
                🗑 DELETE ENTRY
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
