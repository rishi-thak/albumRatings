import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import AlbumList from "./components/AlbumList";
import AlbumDetails from "./components/AlbumDetails";
import PlayAlbum from "./components/PlayAlbum";
import ErrorPage from "./components/ErrorPage";

import { useQueryClient } from "@tanstack/react-query";
import { getAlbums } from "./services/api";

export default function App() {
  const queryClient = useQueryClient();

  

  // ✅ Preload data right when the app starts
  useEffect(() => {
    // make sure to call prefetchQuery using the correct v5 signature
    queryClient.prefetchQuery({
      queryKey: ["albums"],
      queryFn: getAlbums,
    }).catch((err) => console.error("Prefetch failed:", err));
  }, [queryClient]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/albums" element={<AlbumList />} />
        <Route path="/add/:numAlbums" element={<AlbumDetails />} />
        <Route path="/play/:id" element={<PlayAlbum />} />
        <Route path="*" element={<ErrorPage message="Page not found" />} />
      </Routes>
    </Router>
  );
}
