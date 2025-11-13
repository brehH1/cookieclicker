import React, { useEffect, useRef, useState } from "react";
import api from "../api";

export default function Game({ player, onExit }) {
  const [cookies, setCookies] = useState(player.cookies || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [prestigePoints, setPrestigePoints] = useState(
    player.prestige_points || 0
  );

  const username = player.username;

  const lastSent = useRef(cookies);
  const cookiesRef = useRef(cookies);

  useEffect(() => {
    cookiesRef.current = cookies;
  }, [cookies]);

  const prestigeMultiplier = 1 + prestigePoints * 0.1;

  const baseCps = upgrades
    .filter((u) => u.owned)
    .reduce((sum, u) => sum + (u.cps || 0), 0);

  const totalCps = baseCps * prestigeMultiplier;

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/leaderboard");
      if (Array.isArray(res.data)) setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    }
  };

  const fetchUpgrades = async () => {
    try {
      const res = await api.get("/upgrades", { params: { username } });
      if (res.data.ok) setUpgrades(res.data.upgrades);
    } catch (err) {
      console.error("Upgrades fetch failed:", err);
    }
  };

  const handleClick = () => {
    setCookies((c) => c + 1);
  };

  const handleBuyUpgrade = async (upgradeId) => {
    try {
      const res = await api.post("/buy-upgrade", {
        username,
        upgrade_id: upgradeId,
      });

      if (res.data.ok) {
        await fetchUpgrades();
        await fetchLeaderboard();

        const refreshed = await api.post("/auth/login", { username });
        const newCookies = refreshed.data.player.cookies;

        setCookies(newCookies);
        cookiesRef.current = newCookies;
        lastSent.current = newCookies;
        setPrestigePoints(refreshed.data.player.prestige_points || 0);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Osto epäonnistui");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (totalCps > 0) {
        setCookies((c) => c + totalCps);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalCps]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const current = cookiesRef.current;

      if (current !== lastSent.current) {
        try {
          setSaving(true);

          await api.post("/update", {
            username,
            cookies: current,
          });

          lastSent.current = current;
          fetchLeaderboard();
        } catch (err) {
          console.error("Save failed:", err);
        } finally {
          setSaving(false);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [username]);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchLeaderboard(), fetchUpgrades()]);

      setCookies(player.cookies);
      cookiesRef.current = player.cookies;
      lastSent.current = player.cookies;
      setPrestigePoints(player.prestige_points || 0);

      setLoading(false);
    })();
  }, []);

  const handlePrestige = async () => {
    try {
      const res = await api.post("/prestige", { username });

      if (!res.data.ok) {
        alert(res.data.error || "Prestige epäonnistui");
        return;
      }

      alert(
        `⭐ Prestige suoritettu!\n\n` +
          `Sait ${res.data.gained} prestige-pistettä.\n` +
          `Yhteensä: ${res.data.prestige_points}\n` +
          `Uusi kerroin: x${res.data.multiplier.toFixed(1)}`
      );

      setCookies(0);
      cookiesRef.current = 0;
      lastSent.current = 0;
      setPrestigePoints(res.data.prestige_points);
      setUpgrades([]);
      await fetchUpgrades();
      await fetchLeaderboard();
    } catch (err) {
      alert("Prestige epäonnistui");
      console.error(err);
    }
  };

  const PRESTIGE_COST = 1000; 

  if (loading) {
    return <p style={{ textAlign: "center" }}>Ladataan peliä...</p>;
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>Tervetuloa, {username}!</h2>
      <h3>Keksit: {cookies}</h3>
      <h4>
        CPS: {totalCps}{" "}
        <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
          (base {baseCps}, prestige x{prestigeMultiplier.toFixed(1)})
        </span>
      </h4>
      <h4>Prestige-pisteet: {prestigePoints}</h4>

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

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handlePrestige}
          disabled={cookies < PRESTIGE_COST}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: cookies >= PRESTIGE_COST ? "#ffbb00" : "#777",
            border: "none",
            borderRadius: "8px",
            cursor: cookies >= PRESTIGE_COST ? "pointer" : "default",
          }}
        >
          ⭐ Prestige (vaatii {PRESTIGE_COST} keksiä)
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
          <p>Ei pisteitä vielä...</p>
        )}
      </div>

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
