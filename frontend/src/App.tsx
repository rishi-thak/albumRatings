import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AlbumList from "./components/AlbumList";
import AlbumDetails from "./components/AlbumDetails";
import PlayAlbum from "./components/PlayAlbum";
import ErrorPage from "./components/ErrorPage";

export default function App() {
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
