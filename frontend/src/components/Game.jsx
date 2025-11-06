import React, { useEffect, useState } from "react";
import api from "../api";

export default function Game({ player, onExit }) {
  const [cookies, setCookies] = useState(player.cookies || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClick = async () => {
    const newCount = cookies + 1;
    setCookies(newCount);
    try {
      setSaving(true);
      await api.post("/update", {
        username: player.username,
        cookies: newCount,
      });
      await fetchLeaderboard(); 
    } catch (err) {
      console.error("❌ Failed to update cookies:", err);
    } finally {
      setSaving(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/leaderboard");
      console.log("📊 Leaderboard data:", res.data);
      if (Array.isArray(res.data)) {
        setLeaderboard(res.data);
      } else {
        console.warn("Unexpected leaderboard format:", res.data);
      }
    } catch (err) {
      console.error("❌ Failed to load leaderboard:", err);
    }
  };

  const fetchUpgrades = async () => {
    try {
      const res = await api.get("/upgrades", {
        params: { username: player.username },
      });
      if (res.data.ok && res.data.upgrades) {
        setUpgrades(res.data.upgrades);
      }
    } catch (err) {
      console.error("❌ Failed to load upgrades:", err);
    }
  };

  const handleBuyUpgrade = async (id) => {
    try {
      const res = await api.post("/buy-upgrade", {
        username: player.username,
        upgrade_id: id,
      });

      if (res.data.ok) {
        alert("✅ Upgrade purchased!");
        await fetchUpgrades();
        await fetchLeaderboard();
        const playerRes = await api.post("/auth/login", {
          username: player.username,
        });
        setCookies(playerRes.data.player.cookies);
      }
    } catch (err) {
      alert(err.response?.data?.error || "❌ Purchase failed");
    }
  };

  useEffect(() => {
    (async () => {
      await fetchLeaderboard();
      await fetchUpgrades();
      setLoading(false);
    })();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Ladataan peliä...</p>;

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>Tervetuloa, {player.username}!</h2>
      <h3>Cookies: {cookies}</h3>

      <button
        className="cookie-button"
        onClick={handleClick}
        disabled={saving}
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: "none",
          backgroundImage: "url('/cookie.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
          margin: "1rem 0",
        }}
      >
        {!saving && "Klikkaa!"}
      </button>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={fetchLeaderboard}>🔁 Reloadaa tulokset</button>
        <button
          style={{ marginLeft: "1rem", backgroundColor: "#ff4444" }}
          onClick={onExit}
        >
          🚪 Poistu
        </button>
      </div>

     
      <div style={{ marginTop: "2rem" }}>
        <h3>Tulokset</h3>
        {leaderboard.length > 0 ? (
          <ol
            style={{
              textAlign: "left",
              display: "inline-block",
              width: "230px",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "1rem",
              borderRadius: "10px",
            }}
          >
            {leaderboard.map((entry, i) => (
              <li key={i}>
                {i + 1}. {entry.username}: {entry.cookies}
              </li>
            ))}
          </ol>
        ) : (
          <p>Ei pisteitä...</p>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Päivitykset</h3>
        {upgrades.length === 0 ? (
          <p>Ei päivityksiä avoinna.</p>
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
                  {upg.name} — Maksaa: {upg.cost} cookies
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
