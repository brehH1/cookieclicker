'use client';

import { useGameStore } from '@/lib/store';
import { calculateBuildingCost, formatNumber } from '@/lib/gameData';

export default function BuildingShop() {
  const { cookies, buildings, buyBuilding } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Buildings</h2>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {buildings.map((building) => {
          const cost = calculateBuildingCost(building);
          const canAfford = cookies >= cost;
          const production = building.baseProduction * building.count;

          return (
            <button
              key={building.id}
              onClick={() => buyBuilding(building.id)}
              disabled={!canAfford}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                canAfford
                  ? 'border-green-500 bg-green-50 hover:bg-green-100 hover:scale-102 cursor-pointer'
                  : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{building.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {building.name}
                      </h3>
                      <p className="text-sm text-gray-600">{building.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-blue-600 font-semibold">
                      Cost: {formatNumber(cost)}
                    </span>
                    <span className="text-purple-600">
                      Produces: {building.baseProduction}/s
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gray-700">
                    {building.count}
                  </div>
                  {production > 0 && (
                    <div className="text-xs text-green-600">
                      {formatNumber(production)}/s
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
