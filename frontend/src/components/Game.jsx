import React, { useEffect, useState } from "react";
import api from "../api";

export default function Game({ player, onExit }) {
  const [cookies, setCookies] = useState(player.cookies || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🍪 Handle cookie click
  const handleClick = async () => {
    const newCount = cookies + 1;
    setCookies(newCount);
    try {
      setSaving(true);
      await api.post("/update", { username: player.username, cookies: newCount });
    } catch (err) {
      console.error("❌ Failed to update cookies:", err);
    } finally {
      setSaving(false);
    }
  };

  // 🏆 Load leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/leaderboard");
      if (res.data.ok) setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error("❌ Failed to load leaderboard:", err);
    }
  };

  // 🧩 Load upgrades
  const fetchUpgrades = async () => {
    try {
      const res = await api.get("/upgrades", {
        params: { username: player.username },
      });
      if (res.data.ok) setUpgrades(res.data.upgrades);
    } catch (err) {
      console.error("❌ Failed to load upgrades:", err);
    }
  };

  // 🛒 Buy upgrade
  const handleBuyUpgrade = async (id) => {
    try {
      const res = await api.post("/buy-upgrade", {
        username: player.username,
        upgrade_id: id,
      });

      if (res.data.ok) {
        alert("✅ Upgrade purchased!");
        // Reload both player cookies and upgrades
        await fetchUpgrades();
        await fetchLeaderboard();
        const playerRes = await api.post("/auth/login", { username: player.username });
        setCookies(playerRes.data.player.cookies);
      }
    } catch (err) {
      alert(err.response?.data?.error || "❌ Purchase failed");
    }
  };

  // 🔄 Initial load
  useEffect(() => {
    (async () => {
      await fetchLeaderboard();
      await fetchUpgrades();
      setLoading(false);
    })();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading game...</p>;

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>Welcome, {player.username}!</h2>
      <h3>Cookies: {cookies}</h3>

      {/* 🍪 Cookie Button */}
      <button
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          backgroundColor: "#c99700",
          color: "white",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
        onClick={handleClick}
        disabled={saving}
      >
        {saving ? "Saving..." : "🍪 Click Me!"}
      </button>

      {/* 🔁 Refresh + Exit Buttons */}
      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={fetchLeaderboard}>🔁 Refresh Leaderboard</button>
        <button
          style={{ marginLeft: "1rem", backgroundColor: "#ff4444" }}
          onClick={onExit}
        >
          🚪 Exit
        </button>
      </div>

      {/* 🏆 Leaderboard */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Leaderboard</h3>
        <ol style={{ textAlign: "left", display: "inline-block" }}>
          {leaderboard.map((entry, i) => (
            <li key={i}>
              {entry.username}: {entry.cookies}
            </li>
          ))}
        </ol>
      </div>

      {/* 🧩 Upgrades Section */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Upgrades</h3>
        {upgrades.length === 0 ? (
          <p>No upgrades available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {upgrades.map((upg) => (
              <li key={upg.id}>
                <button
                  onClick={() => handleBuyUpgrade(upg.id)}
                  disabled={upg.owned || cookies < upg.cost}
                  style={{
                    margin: "0.3rem",
                    backgroundColor: upg.owned
                      ? "#777"
                      : cookies >= upg.cost
                      ? "#4CAF50"
                      : "#ccc",
                  }}
                >
                  {upg.name} — Cost: {upg.cost} cookies
                  {upg.owned ? " ✅" : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
