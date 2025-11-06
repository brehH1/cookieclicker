'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';

export default function Achievements() {
  const { achievements } = useGameStore();
  const [showAll, setShowAll] = useState(false);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const displayAchievements = showAll
    ? achievements
    : achievements.filter((a) => a.unlocked);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Achievements ({unlockedCount}/{achievements.length})
        </h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAll ? 'Show Unlocked' : 'Show All'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {displayAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <h3 className="font-bold text-sm text-gray-800 mb-1">
              {achievement.name}
            </h3>
            <p className="text-xs text-gray-600">{achievement.description}</p>
            {achievement.unlocked && (
              <div className="mt-2 text-xs text-green-600 font-semibold">
                ✓ Unlocked
              </div>
            )}
          </div>
        ))}
      </div>

      {displayAchievements.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Start playing to unlock achievements!
        </p>
      )}
    </div>
  );
}
