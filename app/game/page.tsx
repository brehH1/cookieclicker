'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStore } from '@/lib/store';
import CookieButton from '@/components/CookieButton';
import BuildingShop from '@/components/BuildingShop';
import UpgradeShop from '@/components/UpgradeShop';
import StatsDisplay from '@/components/StatsDisplay';
import Achievements from '@/components/Achievements';
import PrestigeModal from '@/components/PrestigeModal';
import { SAVE_INTERVAL } from '@/lib/gameData';
import { formatNumber } from '@/lib/gameData';

export default function GamePage() {
  const router = useRouter();
  const { loadGame, saveGame, tick, calculateCPS } = useGameStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineCookies, setOfflineCookies] = useState(0);

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Load game data
    loadGame().then(() => {
      const state = useGameStore.getState();
      const offline = state.calculateOfflineProgress(state.lastActive);
      if (offline > 0) {
        setOfflineCookies(offline);
        setShowOfflineModal(true);
      }
      calculateCPS();
    });

    // Game tick (10 times per second for smooth progression)
    const tickInterval = setInterval(() => {
      tick();
    }, 100);

    // Auto-save
    const saveInterval = setInterval(() => {
      saveGame();
    }, SAVE_INTERVAL);

    return () => {
      clearInterval(tickInterval);
      clearInterval(saveInterval);
      saveGame(); // Save on unmount
    };
  }, [loadGame, saveGame, tick, calculateCPS]);

  const handleLogout = async () => {
    await saveGame();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🍪 Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🍪</span>
            <h1 className="text-3xl font-bold text-gray-800">Cookie Clicker</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-600">
                {user.email?.split('@')[0]}
              </span>
            )}
            <button
              onClick={() => router.push('/leaderboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🏆 Leaderboard
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cookie and Stats */}
          <div className="lg:col-span-1 space-y-6">
            <CookieButton />
            <StatsDisplay />
            <Achievements />
          </div>

          {/* Right Column - Shop */}
          <div className="lg:col-span-2 space-y-6">
            <UpgradeShop />
            <BuildingShop />
          </div>
        </div>
      </div>

      {/* Prestige Button */}
      <PrestigeModal />

      {/* Offline Progress Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600 mb-6">
                While you were away, your buildings produced:
              </p>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                <div className="text-5xl font-bold text-green-600">
                  +{formatNumber(offlineCookies)}
                </div>
                <div className="text-gray-600 mt-2">cookies</div>
              </div>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
