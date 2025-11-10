import React, { useState, useEffect } from "react";
import api from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api
      .get("/leaderboard")
      .then((res) => {
        console.log("✅ Leaderboard data:", res.data);
        setLeaderboard(res.data);
      })
      .catch((err) => console.error("❌ Failed to load leaderboard:", err));
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return alert("Lisää nimi ja salasana");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.ok) onLogin(res.data.player);
      else alert(res.data.error || "Virhe kirjautumisessa");
    } catch (err) {
      alert("Kirjautuminen epäonnistui");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-left">
        <h2>Tulokset</h2>
        <ul className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.7 }}>
              ei pisteitä vielä
            </p>
          ) : (
            leaderboard.map((player, i) => (
              <li key={player.id || i}>
                <span>
                  {i + 1}. {player.username}
                </span>
                <span>{player.cookies}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="menu-center">
        <h1>Cookie Clicker 🍪</h1>
        <div className="login-form">
          <input
            placeholder="nimi..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="salasana..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Ladataan..." : "Jatka"}
          </button>
        </div>
      </div>
    </div>
  );
}
