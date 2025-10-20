import React from "react";

export default function ErrorPage({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "red" }}>Error</h1>
      <p>{message}</p>
      <a href="/" style={{ color: "#0c6fa8" }}>Go back to Home</a>
    </div>
  );
}
