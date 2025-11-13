import express from "express";
import cors from "cors";
import { supabase } from "./supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

// LOGIN --------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const { data: existing } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();

    if (existing) return res.json({ ok: true, player: existing });

    const { data: inserted, error } = await supabase
      .from("players")
      .insert({ username, cookies: 0 })
      .select()
      .single();

    if (error) throw error;
    return res.json({ ok: true, player: inserted });
  } catch (err) {
    console.error("Login failed:", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// BATCHED SCORE UPDATE -----------------------------------
app.post("/api/update", async (req, res) => {
  const { username, cookies } = req.body;

  if (!username || typeof cookies !== "number") {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { error } = await supabase
      .from("players")
      .update({ cookies })
      .eq("username", username);

    if (error) throw error;

    return res.json({ ok: true });
  } catch (err) {
    console.error("Update failed:", err.message);
    return res.status(500).json({ error: "Failed to update cookies" });
  }
});

// LEADERBOARD --------------------------------------------
app.get("/api/leaderboard", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("id, username, cookies")
      .order("cookies", { ascending: false })
      .limit(10);

    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    console.error("Leaderboard error:", err.message);
    return res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

// UPGRADES ------------------------------------------------
app.get("/api/upgrades", async (req, res) => {
  const { username } = req.query;

  try {
    const { data: allUpgrades } = await supabase
      .from("upgrades")
      .select("*")
      .order("cost", { ascending: true });

    const { data: owned } = await supabase
      .from("player_upgrades")
      .select("upgrade_id")
      .eq("username", username);

    const ownedIds = (owned || []).map((o) => o.upgrade_id);

    const upgrades = (allUpgrades || []).map((u) => ({
      ...u,
      owned: ownedIds.includes(u.id),
    }));

    return res.json({ ok: true, upgrades });
  } catch (err) {
    console.error("Fetch upgrades failed:", err.message);
    return res.status(500).json({ error: "Failed to load upgrades" });
  }
});

// BUY UPGRADE --------------------------------------------
app.post("/api/buy-upgrade", async (req, res) => {
  const { username, upgrade_id } = req.body;

  if (!username || !upgrade_id) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { data: upgrade } = await supabase
      .from("upgrades")
      .select("*")
      .eq("id", upgrade_id)
      .single();

    const { data: player } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();

    if (player.cookies < upgrade.cost) {
      return res.status(400).json({ error: "Not enough cookies" });
    }

    await supabase
      .from("players")
      .update({ cookies: player.cookies - upgrade.cost })
      .eq("username", username);

    await supabase.from("player_upgrades").insert({ username, upgrade_id });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Buy upgrade failed:", err.message);
    return res.status(500).json({ error: "Failed to buy upgrade" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Cookie Clicker backend running on port ${PORT}`)
);
