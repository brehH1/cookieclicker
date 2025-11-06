'use client';

import { useGameStore } from '@/lib/store';
import { formatNumber } from '@/lib/gameData';

export default function UpgradeShop() {
  const { cookies, upgrades, buyUpgrade, totalCookies } = useGameStore();

  const availableUpgrades = upgrades.filter(
    (u) => !u.purchased && (!u.unlockCondition || totalCookies >= u.unlockCondition)
  );

  if (availableUpgrades.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Upgrades</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableUpgrades.map((upgrade) => {
          const canAfford = cookies >= upgrade.cost;

          return (
            <button
              key={upgrade.id}
              onClick={() => buyUpgrade(upgrade.id)}
              disabled={!canAfford}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                canAfford
                  ? 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100 hover:scale-105 cursor-pointer'
                  : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
              }`}
              title={upgrade.description}
            >
              <div className="text-5xl mb-2">{upgrade.icon}</div>
              <h3 className="font-bold text-sm text-gray-800 mb-1">
                {upgrade.name}
              </h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {upgrade.description}
              </p>
              <div className="text-sm font-semibold text-blue-600">
                {formatNumber(upgrade.cost)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
