import React, { useEffect, useRef, useState } from "react";
import api from "../api";

function formatNumber(n) {
  if (n < 1000) return Number(n.toFixed(1));
  const units = ["k", "M", "B", "T", "Qa", "Qi"];
  let unit = -1;
  while (n >= 1000 && unit < units.length - 1) {
    n /= 1000;
    unit++;
  }
  return Number(n.toFixed(1)) + units[unit];
}

export default function Game({ player, onExit }) {
  const [cookies, setCookies] = useState(player.cookies || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream

  const username = player.username;

  // Keep stable refs for autosave
=======
  const [prestigePoints, setPrestigePoints] = useState(player.prestige_points || 0);
  const [floatTexts, setFloatTexts] = useState([]);

  const username = player.username;
>>>>>>> Stashed changes
  const lastSent = useRef(cookies);
  const cookiesRef = useRef(cookies);

  useEffect(() => {
    cookiesRef.current = cookies;
  }, [cookies]);

<<<<<<< Updated upstream
  // Calculate CPS from owned upgrades
  const cps = upgrades
    .filter(u => u.owned)
    .reduce((sum, u) => sum + (u.cps || 0), 0);
=======
  const prestigeMultiplier = 1 + prestigePoints * 0.1;

  const baseCps = upgrades
    .filter(u => u.owned)
    .reduce((s, u) => s + (u.cps || 0), 0);
>>>>>>> Stashed changes

  const fetchLeaderboard = async () => {
    const res = await api.get("/leaderboard");
    setLeaderboard(res.data);
  };

  const fetchUpgrades = async () => {
    const res = await api.get("/upgrades", { params: { username } });
    if (res.data.ok) setUpgrades(res.data.upgrades);
  };

  const spawnFloat = value => {
    const id = Math.random();
    setFloatTexts(t => [...t, { id, value, x: Math.random() * 60 + 20 }]);
    setTimeout(() => {
      setFloatTexts(t => t.filter(f => f.id !== id));
    }, 700);
  };

  const handleClick = () => {
    setCookies(c => c + 1);
<<<<<<< Updated upstream
  };

  const handleBuyUpgrade = async (upgradeId) => {
    try {
      const res = await api.post("/buy-upgrade", {
        username,
        upgrade_id: upgradeId
      });

      if (res.data.ok) {
        await fetchUpgrades();
        await fetchLeaderboard();

        // Refresh cookies from backend (important!)
        const refreshed = await api.post("/auth/login", { username });
        const newCookies = refreshed.data.player.cookies;

        setCookies(newCookies);
        cookiesRef.current = newCookies;
        lastSent.current = newCookies;
      }
    } catch (err) {
      alert(err.response?.data?.error || "Osto epäonnistui");
=======
    spawnFloat("+1");
  };

  const handleBuyUpgrade = async id => {
    const res = await api.post("/buy-upgrade", { username, upgrade_id: id });
    if (res.data.ok) {
      await fetchUpgrades();
      await fetchLeaderboard();
      const r = await api.get("/player", { params: { username } });
      const newCookies = r.data.cookies;
      setCookies(newCookies);
      cookiesRef.current = newCookies;
      lastSent.current = newCookies;
      setPrestigePoints(r.data.prestige_points || 0);
>>>>>>> Stashed changes
    }
  };

  // AUTO-CPS interval
  useEffect(() => {
<<<<<<< Updated upstream
    const interval = setInterval(() => {
      if (cps > 0) {
        setCookies(c => c + cps);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cps]);
=======
    const i = setInterval(() => {
      if (totalCps > 0) {
        setCookies(c => c + totalCps);
        spawnFloat("+" + formatNumber(totalCps));
      }
    }, 1000);
    return () => clearInterval(i);
  }, [totalCps]);
>>>>>>> Stashed changes

  // AUTOSAVE interval
  useEffect(() => {
    const i = setInterval(async () => {
      const current = cookiesRef.current;
<<<<<<< Updated upstream

      if (current !== lastSent.current) {
        try {
          setSaving(true);

          await api.post("/update", {
            username,
            cookies: current
          });

          lastSent.current = current;
          fetchLeaderboard();
        } catch (err) {
          console.error("Save failed:", err);
        } finally {
          setSaving(false);
        }
      }
=======
      setSaving(true);
      await api.post("/update", { username, cookies: current });
      lastSent.current = current;
      fetchLeaderboard();
      setSaving(false);
>>>>>>> Stashed changes
    }, 3000);
    return () => clearInterval(i);
  }, [username]);

  // INITIAL LOAD
  useEffect(() => {
    (async () => {
      await Promise.all([fetchLeaderboard(), fetchUpgrades()]);
<<<<<<< Updated upstream

      // Make sure our cookies match backend login result (offline baked in)
      setCookies(player.cookies);
      cookiesRef.current = player.cookies;
      lastSent.current = player.cookies;

=======
      setCookies(player.cookies);
      cookiesRef.current = player.cookies;
      lastSent.current = player.cookies;
      setPrestigePoints(player.prestige_points || 0);
>>>>>>> Stashed changes
      setLoading(false);
    })();
  }, []);

<<<<<<< Updated upstream
  if (loading) {
    return <p style={{ textAlign: "center" }}>Ladataan peliä...</p>;
  }
=======
  const handlePrestige = async () => {
    const res = await api.post("/prestige", { username });
    if (!res.data.ok) {
      alert(res.data.error);
      return;
    }
    alert(`⭐ Prestige suoritettu!\n\nSait ${res.data.gained} pistettä.\nYhteensä: ${res.data.prestige_points}`);
    setCookies(0);
    cookiesRef.current = 0;
    lastSent.current = 0;
    setPrestigePoints(res.data.prestige_points);
    setUpgrades([]);
    await fetchUpgrades();
    await fetchLeaderboard();
  };

  const PRESTIGE_COST = 1000;

  if (loading) return <p>Ladataan peliä...</p>;
>>>>>>> Stashed changes

  return (
    <div className="card" style={{ textAlign: "center", position: "relative" }}>
      <h2>Tervetuloa, {username}!</h2>
<<<<<<< Updated upstream
      <h3>Keksit: {cookies}</h3>
      <h4>CPS: {cps}</h4>
=======

      <h3>Keksit: {formatNumber(cookies)}</h3>

      <h4>
        CPS: {formatNumber(totalCps)}
        <span style={{ fontSize: "0.9em", opacity: 0.7 }}>
          {" "} (base {formatNumber(baseCps)}, x{Number(prestigeMultiplier.toFixed(1))})
        </span>
      </h4>

      <h4>Prestige-pisteet: {prestigePoints}</h4>
>>>>>>> Stashed changes

      <button
        onClick={handleClick}
        disabled={saving}
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: "none",
          backgroundImage: "url('/cookie.png')",
          backgroundSize: "cover",
          cursor: "pointer",
          margin: "1rem 0",
          position: "relative",
          overflow: "visible"
        }}
      >
        {floatTexts.map(t => (
          <div
            key={t.id}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "28px",
              color: "#fff",
              animation: "floatUp 0.7s ease-out forwards",
              pointerEvents: "none",
              fontWeight: "bold",
              textShadow: "0 0 8px black"
            }}
          >
            {t.value}
          </div>
        ))}
        🍪
      </button>

      <div>
        <button onClick={fetchLeaderboard}>🔁 Päivitä</button>
        <button onClick={onExit} style={{ marginLeft: "1rem", background: "#f44" }}>
          🚪 Poistu
        </button>
      </div>

<<<<<<< Updated upstream
      {/* Leaderboard */}
=======
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handlePrestige}
          disabled={cookies < PRESTIGE_COST}
          style={{
            padding: "0.5rem 1rem",
            background: cookies >= PRESTIGE_COST ? "#ffbb00" : "#777",
            borderRadius: "8px"
          }}
        >
          ⭐ Prestige ({formatNumber(PRESTIGE_COST)})
        </button>
      </div>

>>>>>>> Stashed changes
      <div style={{ marginTop: "2rem" }}>
        <h3>Tulokset</h3>
        <ol
          style={{
            textAlign: "left",
            display: "inline-block",
            width: "230px",
            background: "rgba(255,255,255,0.1)",
            padding: "1rem",
            borderRadius: "10px"
          }}
        >
          {leaderboard.map((e, i) => (
            <li key={i}>
              {i + 1}. {e.username}: {formatNumber(e.cookies)}
            </li>
          ))}
        </ol>
      </div>

      {/* Upgrades */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Päivitykset</h3>
<<<<<<< Updated upstream

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
=======
        <ul style={{ listStyle: "none", padding: 0 }}>
          {upgrades.map(u => (
            <li key={u.id}>
              <button
                onClick={() => handleBuyUpgrade(u.id)}
                disabled={u.owned || cookies < u.cost}
                style={{
                  margin: "0.3rem",
                  background: u.owned
                    ? "#777"
                    : cookies >= u.cost
                    ? "#4CAF50"
                    : "#ccc"
                }}
              >
                {u.name} — {formatNumber(u.cost)} — +{formatNumber(u.cps)} {u.owned ? "✓" : ""}
              </button>
            </li>
          ))}
        </ul>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
