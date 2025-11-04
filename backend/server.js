import express from "express";
import cors from "cors";
import { supabase } from "./supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

/* --- AUTH / LOGIN --- */
app.post("/api/auth/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const { data: existing } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();

    if (existing) {
      return res.json({ ok: true, player: existing });
    }

    const { data: inserted, error } = await supabase
      .from("players")
      .insert({ username })
      .select()
      .single();

    if (error) throw error;
    res.json({ ok: true, player: inserted });
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

/* --- UPDATE COOKIES --- */
app.post("/api/update", async (req, res) => {
  const { username, cookies } = req.body;

  try {
    const { error } = await supabase
      .from("players")
      .update({ cookies })
      .eq("username", username);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Update failed:", err.message);
    res.status(500).json({ error: "Failed to update cookies" });
  }
});

/* --- LEADERBOARD --- */
app.get("/api/leaderboard", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("username, cookies")
      .order("cookies", { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json({ ok: true, leaderboard: data });
  } catch (err) {
    console.error("❌ Leaderboard error:", err.message);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

/* --- UPGRADES --- */
app.get("/api/upgrades", async (req, res) => {
  const { username } = req.query;
  try {
    const { data: allUpgrades, error: uError } = await supabase
      .from("upgrades")
      .select("*")
      .order("cost", { ascending: true });
    if (uError) throw uError;

    const { data: owned, error: oError } = await supabase
      .from("player_upgrades")
      .select("upgrade_id")
      .eq("username", username);
    if (oError) throw oError;

    const ownedIds = owned.map((o) => o.upgrade_id);
    const upgrades = allUpgrades.map((u) => ({
      ...u,
      owned: ownedIds.includes(u.id),
    }));

    res.json({ ok: true, upgrades });
  } catch (err) {
    console.error("❌ Fetch upgrades failed:", err.message);
    res.status(500).json({ error: "Failed to load upgrades" });
  }
});

/* --- BUY UPGRADE --- */
app.post("/api/buy-upgrade", async (req, res) => {
  const { username, upgrade_id } = req.body;

  try {
    const { data: upgrade, error: upgErr } = await supabase
      .from("upgrades")
      .select("*")
      .eq("id", upgrade_id)
      .single();
    if (upgErr) throw upgErr;

    const { data: player, error: pErr } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();
    if (pErr) throw pErr;

    if (player.cookies < upgrade.cost) {
      return res.status(400).json({ error: "Not enough cookies" });
    }

    await supabase
      .from("players")
      .update({ cookies: player.cookies - upgrade.cost })
      .eq("username", username);

    await supabase
      .from("player_upgrades")
      .insert({ username, upgrade_id });

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Buy upgrade failed:", err.message);
    res.status(500).json({ error: "Failed to buy upgrade" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Cookie Clicker backend running on port ${PORT}`)
);
