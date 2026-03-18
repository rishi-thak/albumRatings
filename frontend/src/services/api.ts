// src/services/api.ts
export interface Album {
  id: number;
  title: string;
  artist: string;
  genre: string;
  rating: number;
  rater: string;
  just: string;
  cover_url?: string;
  spotify_url?: string;
}

// ✅ Use relative path for Vercel functions, or environment variable for local dev override
const API_BASE = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || "/api/albums";

export async function getAlbums(): Promise<Album[]> {
  const res = await fetch(API_BASE + "/");
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
}

export async function addAlbum(album: any) {
  const res = await fetch(API_BASE + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(album),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Add failed:", res.status, err);
    throw new Error(`Add failed (${res.status})`);
  }
  return res.json();
}

export async function deleteAlbum(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete album");
  return res.json();
}

export async function getSpotifyInfo(id: number) {
  const res = await fetch(`${API_BASE}/${id}/spotify`);
  if (!res.ok) throw new Error("Failed to get Spotify data");
  return res.json();
}
