'use client';

import { useGameStore } from '@/lib/store';
import { formatNumber } from '@/lib/gameData';

export default function StatsDisplay() {
  const { cps, prestigeLevel, prestigeMultiplier, totalCookies, clickPower } =
    useGameStore();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics</h2>
      
      <div className="space-y-3">
        <StatItem
          label="Cookies per Second"
          value={formatNumber(cps * prestigeMultiplier)}
          icon="⚡"
        />
        <StatItem
          label="Click Power"
          value={formatNumber(clickPower * prestigeMultiplier)}
          icon="👆"
        />
        <StatItem
          label="Total Cookies Baked"
          value={formatNumber(totalCookies)}
          icon="🎂"
        />
        {prestigeLevel > 0 && (
          <>
            <StatItem
              label="Prestige Level"
              value={prestigeLevel.toString()}
              icon="⭐"
            />
            <StatItem
              label="Prestige Multiplier"
              value={`×${prestigeMultiplier.toFixed(1)}`}
              icon="✨"
            />
          </>
        )}
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <span className="text-xl font-bold text-blue-600">{value}</span>
    </div>
  );
}
