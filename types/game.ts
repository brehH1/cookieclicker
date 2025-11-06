export interface Building {
  id: string;
  name: string;
  baseCost: number;
  baseProduction: number;
  count: number;
  description: string;
  icon: string;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  description: string;
  multiplier: number;
  purchased: boolean;
  unlockCondition?: number; // cookies needed to unlock
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  unlocked: boolean;
  icon: string;
}

export interface GameState {
  cookies: number;
  totalCookies: number; // all-time total
  cps: number; // cookies per second
  clickPower: number;
  buildings: Building[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  prestigeLevel: number;
  prestigeMultiplier: number;
  lastActive: number; // timestamp
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  total_cookies: number;
  prestige_level: number;
  updated_at: string;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}
