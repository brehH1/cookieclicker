import React, { useState, useEffect } from "react";
import api from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get("/leaderboard")
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error("Leaderboard load error:", err));
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Lisää nimi ja salasana");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      if (!res.data.ok) {
        alert(res.data.error || "Virhe kirjautumisessa");
        return;
      }

      // SHOW OFFLINE POPUP
      if (res.data.offline_gain > 0) {
        alert(
          `🍪 Tervetuloa takaisin!\n\n` +
          `Olit poissa ${res.data.offline_seconds} sekuntia.\n` +
          `Tienasit sinä aikana ${res.data.offline_gain} keksiä!`
        );
      }

      // PASS CORRECT PLAYER AND OFFLINE DATA FOR GAME.JSX
      onLogin({
        ...res.data.player,
        cookies: res.data.player.cookies,
        offline_gain: res.data.offline_gain || 0,
        offline_seconds: res.data.offline_seconds || 0
      });

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
            <p style={{ textAlign: "center", opacity: 0.7 }}>ei pisteitä vielä</p>
          ) : (
            leaderboard.map((p, i) => (
              <li key={p.id || i}>
                <span>{i + 1}. {p.username}</span>
                <span>{p.cookies}</span>
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
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="salasana..."
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Ladataan..." : "Jatka"}
          </button>
        </div>
      </div>
    </div>
  );
}
