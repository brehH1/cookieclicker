import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      game_state: {
        Row: {
          user_id: string;
          cookies: number;
          total_cookies: number;
          cps: number;
          click_power: number;
          buildings: any;
          upgrades: any;
          achievements: any;
          prestige_level: number;
          multiplier: number;
          last_active: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          cookies?: number;
          total_cookies?: number;
          cps?: number;
          click_power?: number;
          buildings?: any;
          upgrades?: any;
          achievements?: any;
          prestige_level?: number;
          multiplier?: number;
          last_active?: string;
        };
        Update: {
          cookies?: number;
          total_cookies?: number;
          cps?: number;
          click_power?: number;
          buildings?: any;
          upgrades?: any;
          achievements?: any;
          prestige_level?: number;
          multiplier?: number;
          last_active?: string;
        };
      };
      leaderboard: {
        Row: {
          user_id: string;
          username: string;
          total_cookies: number;
          prestige_level: number;
          updated_at: string;
        };
      };
    };
  };
}
