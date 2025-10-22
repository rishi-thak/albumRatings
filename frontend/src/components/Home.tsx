import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [numAlbums, setNumAlbums] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (numAlbums < 1) {
      alert("Please enter at least 1 album.");
      return;
    }
    navigate(`/add/${numAlbums}`);
  };

  return (
    <div>
      <header
        style={{
          backgroundColor: "#333",
          color: "white",
          textAlign: "center",
          padding: "10px 0",
        }}
      >
        <h1>Album Ratings</h1>
      </header>

      <div className="container">
        <center>
          <h2>Enter the Number of Albums to Add:</h2>
        </center>
        <input
          type="number"
          value={numAlbums}
          min={1}
          onChange={(e) => setNumAlbums(Number(e.target.value))}
          style={{
            width: "80%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            display: "block",
            margin: "0 auto 10px auto",
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#0c6fa8",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "4px",
            cursor: "pointer",
            width: "80%",
            margin: "0 auto",
            display: "block",
          }}
        >
          Submit
        </button>

        <button
          onClick={() => navigate("/albums")}
          style={{
            marginTop: "10px",
            backgroundColor: "#0c6fa8",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "4px",
            cursor: "pointer",
            width: "80%",
            margin: "10px auto",
            display: "block",
          }}
        >
          View Album List
        </button>
      </div>

      <footer style={{ textAlign: "center", marginTop: "40px" }}>
        <h3>Created by Rishi</h3>
      </footer>
    </div>
  );
}
