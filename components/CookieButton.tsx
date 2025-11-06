'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { FloatingText } from '@/types/game';
import { formatNumber } from '@/lib/gameData';

export default function CookieButton() {
  const { cookies, clickCookie, clickPower, prestigeMultiplier } = useGameStore();
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clickCookie();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Create floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const amount = clickPower * prestigeMultiplier;

    const newText: FloatingText = {
      id: Date.now(),
      text: `+${formatNumber(amount)}`,
      x,
      y,
    };

    setFloatingTexts((prev) => [...prev, newText]);

    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-cookie-brown mb-2">
          {formatNumber(cookies)}
        </h1>
        <p className="text-2xl text-gray-600">cookies</p>
      </div>

      <div className="relative">
        <button
          onClick={handleClick}
          className={`relative w-64 h-64 rounded-full bg-gradient-to-br from-cookie-light to-cookie-brown shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-300 ${
            isAnimating ? 'animate-bounce-cookie' : ''
          }`}
          aria-label="Click cookie"
        >
          <span className="text-9xl">🍪</span>
        </button>

        {/* Floating text effects */}
        {floatingTexts.map((text) => (
          <div
            key={text.id}
            className="absolute text-4xl font-bold text-yellow-500 pointer-events-none animate-float-up"
            style={{
              left: text.x,
              top: text.y,
            }}
          >
            {text.text}
          </div>
        ))}
      </div>
    </div>
  );
}
