import React, { useState } from "react";
import api from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) return alert("Enter a username");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username });
      if (res.data.ok) onLogin(res.data.player);
    } catch (err) {
      alert("Login failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h1>Cookie Clicker</h1>
      <input
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Enter"}
      </button>
    </div>
  );
}
