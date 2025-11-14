import express from "express";
import cors from "cors";
import { supabase } from "./supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

<<<<<<< Updated upstream
// -------------------- LOGIN (offline progress) --------------------
app.post("/api/auth/login", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

=======
app.get("/api/player", async (req, res) => {
  const { username } = req.query;
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("username", username)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

app.post("/api/auth/login", async (req, res) => {
  const { username } = req.body;
  const now = new Date().toISOString();
>>>>>>> Stashed changes
  try {
    // Fetch player
    const { data: player } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .single();

    if (!player) {
      const { data: created } = await supabase
        .from("players")
        .insert({
          username,
          cookies: 0,
<<<<<<< Updated upstream
          last_update: new Date()
=======
          prestige_points: 0,
          last_update: now
>>>>>>> Stashed changes
        })
        .select()
        .single();

      return res.json({
        ok: true,
        player: created,
        offline_gain: 0,
        offline_seconds: 0
      });
    }

<<<<<<< Updated upstream
    // Fetch CPS upgrades
=======
>>>>>>> Stashed changes
    const { data: owned } = await supabase
      .from("player_upgrades")
      .select("upgrade_id")
      .eq("username", username);

<<<<<<< Updated upstream
    const ownedIds = owned.map(o => o.upgrade_id);

    const { data: allUpgrades } = await supabase
      .from("upgrades")
      .select("*");

    const cps = allUpgrades
      .filter(u => ownedIds.includes(u.id))
      .reduce((sum, u) => sum + (u.cps || 0), 0);

    // Offline time
    const last = new Date(player.last_update);
    const now = new Date();

    const seconds = Math.floor((now - last) / 1000);
    const offlineGain = cps * seconds;
=======
    const ownedIds = owned?.map(o => o.upgrade_id) || [];

    const { data: allUpgrades } = await supabase
      .from("upgrades")
      .select("*");

    const baseCps = allUpgrades
      .filter(u => ownedIds.includes(u.id))
      .reduce((s, u) => s + (u.cps || 0), 0);

    const prestige = player.prestige_points || 0;
    const multiplier = 1 + prestige * 0.1;

    const last = new Date(player.last_update + "Z");
    const nowDate = new Date(now);
    const seconds = Math.floor((nowDate - last) / 1000);
    const offlineGain = baseCps * multiplier * seconds;
>>>>>>> Stashed changes
    const newCookies = player.cookies + offlineGain;

    // Save new state
    await supabase
      .from("players")
      .update({
        cookies: newCookies,
        last_update: now
      })
      .eq("username", username);

    // Return CORRECT updated player
    return res.json({
      ok: true,
      player: {
        id: player.id,
        username: player.username,
        cookies: newCookies,
<<<<<<< Updated upstream
=======
        prestige_points: prestige,
>>>>>>> Stashed changes
        last_update: now
      },
      offline_gain: offlineGain,
      offline_seconds: seconds
    });
<<<<<<< Updated upstream

  } catch (err) {
    console.error(err);
=======
  } catch {
>>>>>>> Stashed changes
    return res.status(500).json({ error: "Login failed" });
  }
});


// -------------------- BATCH COOKIE UPDATE --------------------
app.post("/api/update", async (req, res) => {
  const { username, cookies } = req.body;
<<<<<<< Updated upstream

  if (!username || typeof cookies !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    await supabase
      .from("players")
      .update({
        cookies,
        last_update: new Date()
      })
      .eq("username", username);

    return res.json({ ok: true });
  } catch (err) {
    console.error("Update failed:", err);
    return res.status(500).json({ error: "Update failed" });
  }
=======
  const now = new Date().toISOString();
  await supabase
    .from("players")
    .update({
      cookies,
      last_update: now
    })
    .eq("username", username);
  res.json({ ok: true });
>>>>>>> Stashed changes
});

// -------------------- LEADERBOARD --------------------
app.get("/api/leaderboard", async (_req, res) => {
<<<<<<< Updated upstream
  try {
    const { data } = await supabase
      .from("players")
      .select("id, username, cookies")
      .order("cookies", { ascending: false })
      .limit(10);

    return res.json(data || []);
  } catch {
    return res.status(500).json({ error: "Failed to load leaderboard" });
  }
=======
  const { data } = await supabase
    .from("players")
    .select("id, username, cookies")
    .order("cookies", { ascending: false })
    .limit(10);
  return res.json(data || []);
>>>>>>> Stashed changes
});

// -------------------- FETCH UPGRADES --------------------
app.get("/api/upgrades", async (req, res) => {
  const { username } = req.query;
  const { data: allUpgrades } = await supabase
    .from("upgrades")
    .select("*")
    .order("cost");

<<<<<<< Updated upstream
  try {
    const { data: allUpgrades } = await supabase
      .from("upgrades")
      .select("*")
      .order("cost");

    const { data: owned } = await supabase
      .from("player_upgrades")
      .select("upgrade_id")
      .eq("username", username);

    const ownedIds = owned.map(o => o.upgrade_id);

    const upgrades = allUpgrades.map(u => ({
      ...u,
      owned: ownedIds.includes(u.id)
    }));

    res.json({ ok: true, upgrades });
  } catch {
    res.status(500).json({ error: "Failed to load upgrades" });
  }
=======
  const { data: owned } = await supabase
    .from("player_upgrades")
    .select("upgrade_id")
    .eq("username", username);

  const ownedIds = owned?.map(o => o.upgrade_id) || [];
  const upgrades = allUpgrades.map(u => ({
    ...u,
    owned: ownedIds.includes(u.id)
  }));

  return res.json({ ok: true, upgrades });
>>>>>>> Stashed changes
});

// -------------------- BUY UPGRADE --------------------
app.post("/api/buy-upgrade", async (req, res) => {
  const { username, upgrade_id } = req.body;
<<<<<<< Updated upstream

  if (!username || !upgrade_id)
    return res.status(400).json({ error: "Invalid request" });

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
=======
  const now = new Date().toISOString();

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
>>>>>>> Stashed changes

  if (player.cookies < upgrade.cost)
    return res.status(400).json({ error: "Not enough cookies" });

<<<<<<< Updated upstream
    await supabase
      .from("players")
      .update({
        cookies: player.cookies - upgrade.cost,
        last_update: new Date()
      })
      .eq("username", username);

    await supabase
      .from("player_upgrades")
      .insert({ username, upgrade_id });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Upgrade failed" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
=======
  await supabase
    .from("players")
    .update({
      cookies: player.cookies - upgrade.cost,
      last_update: now
    })
    .eq("username", username);

  await supabase
    .from("player_upgrades")
    .insert({ username, upgrade_id });

  return res.json({ ok: true });
});

app.post("/api/prestige", async (req, res) => {
  const { username } = req.body;
  const now = new Date().toISOString();
  const DIVISOR = 1000;

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("username", username)
    .single();

  const gain = Math.floor(player.cookies / DIVISOR);
  if (gain < 1)
    return res.status(400).json({ error: "Not enough cookies to prestige." });

  const newPrestige = (player.prestige_points || 0) + gain;

  await supabase
    .from("players")
    .update({
      cookies: 0,
      prestige_points: newPrestige,
      last_update: now
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
    multiplier: 1 + newPrestige * 0.1
  });
});

app.listen(PORT, () => {});
>>>>>>> Stashed changes
