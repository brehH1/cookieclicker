import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import MusicPlayer from "./MusicPlayer"; // ✅ Added

export default function Game({ player, onExit }) {
  const [cookies, setCookies] = useState(player.cookies || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const username = player.username;

  // --- refs to avoid stale closures ---
  const lastSent = useRef(cookies);
  const cookiesRef = useRef(cookies);

  // Keep cookiesRef always updated to latest value
  useEffect(() => {
    cookiesRef.current = cookies;
  }, [cookies]);

  // Total CPS from owned upgrades
  const cps = upgrades
    .filter((u) => u.owned)
    .reduce((sum, u) => sum + (u.cps || 0), 0);

  // --- Fetch leaderboard ---
  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/leaderboard");
      if (Array.isArray(res.data)) setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    }
  };

  // --- Fetch upgrades ---
  const fetchUpgrades = async () => {
    try {
      const res = await api.get("/upgrades", { params: { username } });
      if (res.data.ok) setUpgrades(res.data.upgrades);
    } catch (err) {
      console.error("Upgrades fetch failed:", err);
    }
  };

<<<<<<< Updated upstream
  // --- Klikkauslogiikka ---
  const handleClick = async () => {
    const newCount = cookies + 1;
    setCookies(newCount);
    try {
      setSaving(true);
      await api.post("/update", { username, cookies: newCount });
      await fetchLeaderboard();
    } catch (err) {
      console.error("❌ Failed to update cookies:", err);
    } finally {
      setSaving(false);
    }
=======
  // --- Manual clicking ---
  const handleClick = () => {
    setCookies((c) => c + 1);
>>>>>>> Stashed changes
  };

  // --- Buy upgrade ---
  const handleBuyUpgrade = async (upgradeId) => {
    try {
      const res = await api.post("/buy-upgrade", {
        username,
        upgrade_id: upgradeId,
      });

      if (res.data.ok) {
        // Refresh upgrades and leaderboard
        await fetchUpgrades();
        await fetchLeaderboard();

        // Refresh cookies from backend
        const refreshed = await api.post("/auth/login", { username });
        setCookies(refreshed.data.player.cookies);
        lastSent.current = refreshed.data.player.cookies;
      }
    } catch (err) {
      alert(err.response?.data?.error || "Osto epäonnistui");
    }
  };

  // --- AUTO CPS: add cookies every second ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (cps > 0) {
        setCookies((c) => c + cps);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cps]);

  // --- SAVE TO BACKEND EVERY 3 SECONDS (FIXED) ---
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentCookies = cookiesRef.current;

      if (currentCookies !== lastSent.current) {
        try {
          setSaving(true);

          await api.post("/update", {
            username,
            cookies: currentCookies,
          });

          lastSent.current = currentCookies;

          fetchLeaderboard();
        } catch (err) {
          console.error("Failed to update cookies:", err);
        } finally {
          setSaving(false);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [username]);

  // --- Initial load ---
  useEffect(() => {
    (async () => {
      await Promise.all([fetchLeaderboard(), fetchUpgrades()]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Ladataan peliä...</p>;
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      
      <MusicPlayer />  {/* ✅ Only insertion */}

      <h2>Tervetuloa, {username}!</h2>
      <h3>Keksit: {cookies}</h3>
      <h4>CPS: {cps}</h4>

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
        {!saving && "🍪 Klikkaa!"}
      </button>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={fetchLeaderboard}>🔁 Päivitä tulokset</button>
        <button
          style={{ marginLeft: "1rem", backgroundColor: "#ff4444" }}
          onClick={onExit}
        >
          🚪 Poistu
        </button>
      </div>

      {/* Leaderboard */}
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
          <p>Ei pisteitä vielä...</p>
        )}
      </div>

      {/* Upgrades */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Päivitykset</h3>
        {upgrades.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {upgrades.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => handleBuyUpgrade(u.id)}
                  disabled={u.owned || cookies < u.cost}
                  style={{
                    margin: "0.3rem",
                    backgroundColor: u.owned
                      ? "#777"
                      : cookies >= u.cost
                      ? "#4CAF50"
                      : "#ccc",
                  }}
                >
                  {u.name} — Hinta: {u.cost} — +{u.cps} CPS{" "}
                  {u.owned ? "✅" : ""}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Ei päivityksiä.</p>
        )}
      </div>
    </div>
  );
}
