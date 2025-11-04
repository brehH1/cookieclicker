import React, { useEffect, useState } from "react";
import api from "../api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/leaderboard");
        if (res.data.ok) setLeaders(res.data.leaderboard);
      } catch (err) {
        console.error("❌ Failed to load leaderboard:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="card">
      <h2>Leaderboard (Top 10)</h2>
      <ol>
        {leaders.map((l, i) => (
          <li key={i}>
            {l.username}: {l.cookies}
          </li>
        ))}
      </ol>
    </div>
  );
}
