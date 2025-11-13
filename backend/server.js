import express from "express";
import cors from "cors";
import { supabase } from "./supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

async function getUserCps(username) {
  const { data: owned } = await supabase
    .from("player_upgrades")
    .select("upgrade_id")
    .eq("username", username);

  const ownedIds = (owned || []).map((o) => o.upgrade_id);

  const { data: allUpgrades } = await supabase.from("upgrades").select("*");

  const baseCps = (allUpgrades || [])
    .filter((u) => ownedIds.includes(u.id))
    .reduce((sum, u) => sum + (u.cps || 0), 0);

  return baseCps;
}

app.post("/api/auth/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const { data: player } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();

    if (!player) {
      const { data: created, error } = await supabase
        .from("players")
        .insert({
          username,
          cookies: 0,
          prestige_points: 0,
          last_update: new Date(),
        })
        .select()
        .single();

      if (error) throw error;

      return res.json({
        ok: true,
        player: created,
        offline_gain: 0,
        offline_seconds: 0,
      });
    }

    const baseCps = await getUserCps(username);
    const prestigePoints = player.prestige_points || 0;
    const multiplier = 1 + prestigePoints * 0.1;
    const effectiveCps = baseCps * multiplier;

    const last = new Date(player.last_update);
    const now = new Date();
    const seconds = Math.floor((now - last) / 1000);

    const offlineGain = effectiveCps * seconds;
    const newCookies = player.cookies + offlineGain;

    await supabase
      .from("players")
      .update({
        cookies: newCookies,
        last_update: now,
      })
      .eq("username", username);

    return res.json({
      ok: true,
      player: {
        id: player.id,
        username: player.username,
        cookies: newCookies,
        last_update: now,
        prestige_points: prestigePoints,
      },
      offline_gain: offlineGain,
      offline_seconds: seconds,
    });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/update", async (req, res) => {
  const { username, cookies } = req.body;
  if (!username || typeof cookies !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    await supabase
      .from("players")
      .update({
        cookies,
        last_update: new Date(),
      })
      .eq("username", username);

    return res.json({ ok: true });
  } catch (err) {
    console.error("Update failed:", err);
    return res.status(500).json({ error: "Update failed" });
  }
});

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
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

app.get("/api/upgrades", async (req, res) => {
  const { username } = req.query;

  try {
    const { data: allUpgrades, error: upErr } = await supabase
      .from("upgrades")
      .select("*")
      .order("cost", { ascending: true });
    if (upErr) throw upErr;

    const { data: owned, error: ownErr } = await supabase
      .from("player_upgrades")
      .select("upgrade_id")
      .eq("username", username);
    if (ownErr) throw ownErr;

    const ownedIds = (owned || []).map((o) => o.upgrade_id);
    const upgrades = (allUpgrades || []).map((u) => ({
      ...u,
      owned: ownedIds.includes(u.id),
    }));

    return res.json({ ok: true, upgrades });
  } catch (err) {
    console.error("Fetch upgrades failed:", err);
    return res.status(500).json({ error: "Failed to load upgrades" });
  }
});

app.post("/api/buy-upgrade", async (req, res) => {
  const { username, upgrade_id } = req.body;
  if (!username || !upgrade_id) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const { data: upgrade, error: upErr } = await supabase
      .from("upgrades")
      .select("*")
      .eq("id", upgrade_id)
      .single();
    if (upErr) throw upErr;

    const { data: player, error: plErr } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();
    if (plErr) throw plErr;

    if (player.cookies < upgrade.cost) {
      return res.status(400).json({ error: "Not enough cookies" });
    }

    await supabase
      .from("players")
      .update({
        cookies: player.cookies - upgrade.cost,
        last_update: new Date(),
      })
      .eq("username", username);

    await supabase.from("player_upgrades").insert({ username, upgrade_id });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Buy upgrade failed:", err);
    return res.status(500).json({ error: "Failed to buy upgrade" });
  }
});

app.post("/api/prestige", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const PRESTIGE_DIVISOR = 1000; // 1000 cookies -> 1 prestige point

  try {
    const { data: player, error: plErr } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();
    if (plErr || !player) throw plErr || new Error("Player not found");

    const gain = Math.floor(player.cookies / PRESTIGE_DIVISOR);
    if (gain < 1) {
      return res
        .status(400)
        .json({ error: "Not enough cookies to prestige yet." });
    }

    const newPrestige = (player.prestige_points || 0) + gain;
    const multiplier = 1 + newPrestige * 0.1;

    await supabase
      .from("players")
      .update({
        cookies: 0,
        prestige_points: newPrestige,
        last_update: new Date(),
      })
      .eq("username", username);

    await supabase
      .from("player_upgrades")
      .delete()
      .eq("username", username);

    return res.json({
      ok: true,
      gained: gain,
      prestige_points: newPrestige,
      multiplier,
    });
  } catch (err) {
    console.error("Prestige failed:", err);
    return res.status(500).json({ error: "Prestige failed" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Cookie Clicker backend running on port ${PORT}`)
);
