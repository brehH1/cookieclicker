import { Building, Upgrade, Achievement } from '@/types/game';

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    baseCost: 15,
    baseProduction: 0.1,
    count: 0,
    description: 'Autoclicks once every 10 seconds',
    icon: '👆',
  },
  {
    id: 'grandma',
    name: 'Grandma',
    baseCost: 100,
    baseProduction: 1,
    count: 0,
    description: 'A nice grandma to bake more cookies',
    icon: '👵',
  },
  {
    id: 'farm',
    name: 'Farm',
    baseCost: 1100,
    baseProduction: 8,
    count: 0,
    description: 'Grows cookie plants from cookie seeds',
    icon: '🌾',
  },
  {
    id: 'mine',
    name: 'Mine',
    baseCost: 12000,
    baseProduction: 47,
    count: 0,
    description: 'Mines out cookie dough and chocolate chips',
    icon: '⛏️',
  },
  {
    id: 'factory',
    name: 'Factory',
    baseCost: 130000,
    baseProduction: 260,
    count: 0,
    description: 'Produces large quantities of cookies',
    icon: '🏭',
  },
  {
    id: 'bank',
    name: 'Bank',
    baseCost: 1400000,
    baseProduction: 1400,
    count: 0,
    description: 'Generates cookies from interest',
    icon: '🏦',
  },
  {
    id: 'temple',
    name: 'Temple',
    baseCost: 20000000,
    baseProduction: 7800,
    count: 0,
    description: 'Full of precious chocolate',
    icon: '⛩️',
  },
  {
    id: 'wizard',
    name: 'Wizard Tower',
    baseCost: 330000000,
    baseProduction: 44000,
    count: 0,
    description: 'Summons cookies with magic spells',
    icon: '🧙',
  },
  {
    id: 'shipment',
    name: 'Shipment',
    baseCost: 5100000000,
    baseProduction: 260000,
    count: 0,
    description: 'Brings in fresh cookies from the cookie planet',
    icon: '🚀',
  },
  {
    id: 'alchemy',
    name: 'Alchemy Lab',
    baseCost: 75000000000,
    baseProduction: 1600000,
    count: 0,
    description: 'Turns gold into cookies',
    icon: '⚗️',
  },
];

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'reinforced_cursor',
    name: 'Reinforced Index Finger',
    cost: 100,
    description: 'The mouse and cursors are twice as efficient',
    multiplier: 2,
    purchased: false,
    unlockCondition: 1,
    icon: '💪',
  },
  {
    id: 'grandma_helper',
    name: "Grandma's Helpers",
    cost: 1000,
    description: 'Grandmas are twice as efficient',
    multiplier: 2,
    purchased: false,
    unlockCondition: 1,
    icon: '👶',
  },
  {
    id: 'fertilizer',
    name: 'Cheap Fertilizer',
    cost: 11000,
    description: 'Farms are twice as efficient',
    multiplier: 2,
    purchased: false,
    unlockCondition: 10,
    icon: '🌱',
  },
  {
    id: 'sugar_gas',
    name: 'Sugar Gas',
    cost: 120000,
    description: 'Mines are twice as efficient',
    multiplier: 2,
    purchased: false,
    unlockCondition: 50,
    icon: '⛽',
  },
  {
    id: 'megadrill',
    name: 'Megadrill',
    cost: 1200000,
    description: 'Factories are twice as efficient',
    multiplier: 2,
    purchased: false,
    unlockCondition: 100,
    icon: '🔩',
  },
  {
    id: 'golden_switch',
    name: 'Golden Switch',
    cost: 999999999,
    description: 'All production doubled',
    multiplier: 2,
    purchased: false,
    unlockCondition: 1000000,
    icon: '✨',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_cookie',
    name: 'Wake and Bake',
    description: 'Bake your first cookie',
    condition: (state) => state.totalCookies >= 1,
    unlocked: false,
    icon: '🍪',
  },
  {
    id: 'hundred_cookies',
    name: 'Making Dough',
    description: 'Bake 100 cookies',
    condition: (state) => state.totalCookies >= 100,
    unlocked: false,
    icon: '💯',
  },
  {
    id: 'thousand_cookies',
    name: 'So Much Dough',
    description: 'Bake 1,000 cookies',
    condition: (state) => state.totalCookies >= 1000,
    unlocked: false,
    icon: '🎉',
  },
  {
    id: 'first_building',
    name: 'Click Delegator',
    description: 'Purchase your first building',
    condition: (state) => state.buildings.some((b) => b.count > 0),
    unlocked: false,
    icon: '🏠',
  },
  {
    id: 'ten_buildings',
    name: 'Entrepreneur',
    description: 'Own 10 buildings',
    condition: (state) =>
      state.buildings.reduce((sum, b) => sum + b.count, 0) >= 10,
    unlocked: false,
    icon: '💼',
  },
  {
    id: 'first_prestige',
    name: 'Rebirth',
    description: 'Prestige for the first time',
    condition: (state) => state.prestigeLevel >= 1,
    unlocked: false,
    icon: '♻️',
  },
];

export const PRESTIGE_THRESHOLD = 1000000000000; // 1 trillion cookies
export const PRESTIGE_MULTIPLIER_BASE = 0.5; // +50% per prestige level
export const SAVE_INTERVAL = 10000; // Save every 10 seconds
export const TICK_RATE = 1000; // Game tick every second

// Cost calculation: baseCost * 1.15^count
export const calculateBuildingCost = (building: Building): number => {
  return Math.floor(building.baseCost * Math.pow(1.15, building.count));
};

// Format large numbers
export const formatNumber = (num: number): string => {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
  return (num / 1000000000000).toFixed(1) + 'T';
};
