'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { PRESTIGE_THRESHOLD, PRESTIGE_MULTIPLIER_BASE, formatNumber } from '@/lib/gameData';

export default function PrestigeModal() {
  const { totalCookies, prestigeLevel, prestige } = useGameStore();
  const [showModal, setShowModal] = useState(false);

  const canPrestige = totalCookies >= PRESTIGE_THRESHOLD;
  const nextMultiplier = 1 + (prestigeLevel + 1) * PRESTIGE_MULTIPLIER_BASE;

  const handlePrestige = async () => {
    await prestige();
    setShowModal(false);
  };

  if (!canPrestige) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 animate-pulse"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">♻️</span>
          <span>Prestige Available!</span>
        </div>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">♻️</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Prestige
              </h2>
              <p className="text-gray-600">
                Reset your progress for a permanent boost
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
              <div className="space-y-3 text-sm">
                <InfoRow
                  label="Current Prestige Level"
                  value={prestigeLevel.toString()}
                />
                <InfoRow
                  label="New Prestige Level"
                  value={(prestigeLevel + 1).toString()}
                  highlight
                />
                <InfoRow
                  label="New Multiplier"
                  value={`×${nextMultiplier.toFixed(1)}`}
                  highlight
                />
                <InfoRow
                  label="Total Cookies Baked"
                  value={formatNumber(totalCookies)}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> You will lose all cookies, buildings, and
                upgrades. Your prestige multiplier will permanently increase all
                production.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrestige}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                Prestige Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}:</span>
      <span
        className={`font-bold ${
          highlight ? 'text-purple-600 text-lg' : 'text-gray-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
