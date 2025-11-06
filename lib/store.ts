import { create } from 'zustand';
import { GameState, Building, Upgrade, Achievement } from '@/types/game';
import {
  INITIAL_BUILDINGS,
  INITIAL_UPGRADES,
  INITIAL_ACHIEVEMENTS,
  calculateBuildingCost,
  PRESTIGE_MULTIPLIER_BASE,
} from '@/lib/gameData';
import { supabase } from '@/lib/supabase';

interface GameStore extends GameState {
  // Actions
  clickCookie: () => void;
  buyBuilding: (buildingId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  tick: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  prestige: () => Promise<void>;
  calculateOfflineProgress: (lastActive: number) => number;
  checkAchievements: () => void;
  reset: () => void;
}

const getInitialState = (): GameState => ({
  cookies: 0,
  totalCookies: 0,
  cps: 0,
  clickPower: 1,
  buildings: INITIAL_BUILDINGS,
  upgrades: INITIAL_UPGRADES,
  achievements: INITIAL_ACHIEVEMENTS,
  prestigeLevel: 0,
  prestigeMultiplier: 1,
  lastActive: Date.now(),
});

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),

  clickCookie: () => {
    const { clickPower, prestigeMultiplier } = get();
    const amount = clickPower * prestigeMultiplier;
    set((state) => ({
      cookies: state.cookies + amount,
      totalCookies: state.totalCookies + amount,
    }));
    get().checkAchievements();
  },

  buyBuilding: (buildingId: string) => {
    const state = get();
    const building = state.buildings.find((b) => b.id === buildingId);
    if (!building) return;

    const cost = calculateBuildingCost(building);
    if (state.cookies < cost) return;

    set((state) => ({
      cookies: state.cookies - cost,
      buildings: state.buildings.map((b) =>
        b.id === buildingId ? { ...b, count: b.count + 1 } : b
      ),
    }));

    get().calculateCPS();
    get().checkAchievements();
  },

  buyUpgrade: (upgradeId: string) => {
    const state = get();
    const upgrade = state.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade || upgrade.purchased) return;

    if (state.cookies < upgrade.cost) return;

    set((state) => ({
      cookies: state.cookies - upgrade.cost,
      upgrades: state.upgrades.map((u) =>
        u.id === upgradeId ? { ...u, purchased: true } : u
      ),
    }));

    get().calculateCPS();
    get().checkAchievements();
  },

  tick: () => {
    const { cps, prestigeMultiplier } = get();
    const cookiesThisTick = (cps * prestigeMultiplier) / 10; // Divided by 10 for 100ms ticks

    set((state) => ({
      cookies: state.cookies + cookiesThisTick,
      totalCookies: state.totalCookies + cookiesThisTick,
    }));
  },

  calculateCPS: () => {
    const { buildings, upgrades, prestigeMultiplier } = get();
    
    let totalCPS = 0;
    buildings.forEach((building) => {
      let buildingCPS = building.baseProduction * building.count;
      
      // Apply building-specific upgrades
      upgrades
        .filter((u) => u.purchased && u.name.toLowerCase().includes(building.name.toLowerCase()))
        .forEach((upgrade) => {
          buildingCPS *= upgrade.multiplier;
        });
      
      totalCPS += buildingCPS;
    });

    // Apply global upgrades
    const globalUpgrades = upgrades.filter(
      (u) => u.purchased && u.name.toLowerCase().includes('all')
    );
    globalUpgrades.forEach((upgrade) => {
      totalCPS *= upgrade.multiplier;
    });

    set({ cps: totalCPS });
  },

  saveGame: async () => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Save to localStorage if not logged in
      localStorage.setItem('cookieClickerSave', JSON.stringify({
        cookies: state.cookies,
        totalCookies: state.totalCookies,
        cps: state.cps,
        clickPower: state.clickPower,
        buildings: state.buildings,
        upgrades: state.upgrades,
        achievements: state.achievements,
        prestigeLevel: state.prestigeLevel,
        prestigeMultiplier: state.prestigeMultiplier,
        lastActive: Date.now(),
      }));
      return;
    }

    // Save to Supabase
    await supabase.from('game_state').upsert({
      user_id: user.id,
      cookies: state.cookies,
      total_cookies: state.totalCookies,
      cps: state.cps,
      click_power: state.clickPower,
      buildings: state.buildings,
      upgrades: state.upgrades,
      achievements: state.achievements,
      prestige_level: state.prestigeLevel,
      multiplier: state.prestigeMultiplier,
      last_active: new Date().toISOString(),
    });

    // Update leaderboard
    await supabase.from('leaderboard').upsert({
      user_id: user.id,
      username: user.email?.split('@')[0] || 'Anonymous',
      total_cookies: state.totalCookies,
      prestige_level: state.prestigeLevel,
      updated_at: new Date().toISOString(),
    });

    set({ lastActive: Date.now() });
  },

  loadGame: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Load from localStorage
      const saved = localStorage.getItem('cookieClickerSave');
      if (saved) {
        const data = JSON.parse(saved);
        set({
          ...data,
          lastActive: data.lastActive || Date.now(),
        });
        
        // Calculate offline progress
        const offlineCookies = get().calculateOfflineProgress(data.lastActive);
        if (offlineCookies > 0) {
          set((state) => ({
            cookies: state.cookies + offlineCookies,
            totalCookies: state.totalCookies + offlineCookies,
          }));
        }
        
        get().calculateCPS();
        get().checkAchievements();
      }
      return;
    }

    // Load from Supabase
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      set({
        cookies: data.cookies,
        totalCookies: data.total_cookies,
        cps: data.cps,
        clickPower: data.click_power,
        buildings: data.buildings || INITIAL_BUILDINGS,
        upgrades: data.upgrades || INITIAL_UPGRADES,
        achievements: data.achievements || INITIAL_ACHIEVEMENTS,
        prestigeLevel: data.prestige_level,
        prestigeMultiplier: data.multiplier,
        lastActive: new Date(data.last_active).getTime(),
      });

      // Calculate offline progress
      const lastActiveTime = new Date(data.last_active).getTime();
      const offlineCookies = get().calculateOfflineProgress(lastActiveTime);
      
      if (offlineCookies > 0) {
        set((state) => ({
          cookies: state.cookies + offlineCookies,
          totalCookies: state.totalCookies + offlineCookies,
        }));
      }

      get().calculateCPS();
      get().checkAchievements();
    }
  },

  calculateOfflineProgress: (lastActive: number) => {
    const now = Date.now();
    const elapsedSeconds = (now - lastActive) / 1000;
    
    // Cap offline time at 24 hours
    const cappedSeconds = Math.min(elapsedSeconds, 24 * 60 * 60);
    
    const { cps, prestigeMultiplier } = get();
    return cps * prestigeMultiplier * cappedSeconds;
  },

  checkAchievements: () => {
    const state = get();
    let updated = false;

    const newAchievements = state.achievements.map((achievement) => {
      if (!achievement.unlocked && achievement.condition(state)) {
        updated = true;
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });

    if (updated) {
      set({ achievements: newAchievements });
    }
  },

  prestige: async () => {
    const state = get();
    const newPrestigeLevel = state.prestigeLevel + 1;
    const newMultiplier = 1 + newPrestigeLevel * PRESTIGE_MULTIPLIER_BASE;

    set({
      cookies: 0,
      cps: 0,
      buildings: INITIAL_BUILDINGS,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u, purchased: false })),
      prestigeLevel: newPrestigeLevel,
      prestigeMultiplier: newMultiplier,
      lastActive: Date.now(),
    });

    await get().saveGame();
    get().checkAchievements();
  },

  reset: () => {
    set(getInitialState());
  },
}));
