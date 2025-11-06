import React, { useEffect, useState } from "react";
import api from "../api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        
        const res = await api.get("/leaderboard");

       
        if (Array.isArray(res.data)) {
          setLeaders(res.data);
        } else {
          console.warn("Unexpected response:", res.data);
        }
      } catch (err) {
        console.error("❌ Failed to load leaderboard:", err);
      }
    };

    load();

    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h2>Tulokset (Top 10)</h2>
      {leaders.length > 0 ? (
        <ol>
          {leaders.map((l, i) => (
            <li key={l.id || i}>
              {i + 1}. {l.username}: {l.cookies}
            </li>
          ))}
        </ol>
      ) : (
        <p>ei pelaajia...</p>
      )}
    </div>
  );
}
