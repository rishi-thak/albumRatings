import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import Home from "./components/Home";
import AlbumList from "./components/AlbumList";
import AlbumDetails from "./components/AlbumDetails";
import PlayAlbum from "./components/PlayAlbum";
import ErrorPage from "./components/ErrorPage";

import { useQueryClient } from "@tanstack/react-query";
import { getAlbums } from "./services/api";
import { Toaster } from "react-hot-toast";

/**
 * Navigation bar:
 * - Fixed top header
 * - Dark theme, minimal layout
 * - Matches your Tailwind palette
 */
function Nav() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-black tracking-tight text-white text-xl md:text-2xl"
        >
          RISHI'S<span className="text-accent">RECORDS</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/albums"
            className={`px-3 py-2 text-sm font-medium rounded hover:bg-[#1a1a1a] ${
              isHome ? "text-gray-300" : "text-white"
            }`}
          >
            Albums
          </Link>
          <Link
            to="/add/1"
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] transition"
          >
            Add Album
          </Link>
        </nav>
      </div>
    </header>
  );
}

/**
 * App:
 * - Keeps all backend route logic
 * - Prefetches albums for performance
 * - Global Toaster for clean success/error messages
 */
export default function App() {
  const queryClient = useQueryClient();

  // Default to dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Prefetch albums when app mounts
  useEffect(() => {
    queryClient
      .prefetchQuery({
        queryKey: ["albums"],
        queryFn: getAlbums,
      })
      .catch((err) => console.error("Prefetch failed:", err));
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-panel text-gray-200">
      <Router>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/albums" element={<AlbumList />} />
            <Route path="/add/:numAlbums" element={<AlbumDetails />} />
            <Route path="/play/:id" element={<PlayAlbum />} />
            <Route path="*" element={<ErrorPage message="Page not found" />} />
          </Routes>
        </main>
      </Router>

      {/* 🔔 Global Toaster for success/error feedback */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111111",
            color: "#f9fafb",
            border: "1px solid #333",
            fontFamily: "Inter, system-ui, sans-serif",
          },
          success: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#111",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#111",
            },
          },
        }}
      />
    </div>
  );
}
