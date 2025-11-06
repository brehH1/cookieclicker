import React, { useState } from "react";
import Login from "./components/Login";
import Game from "./components/Game";
import CookieBackground from "./components/CookieBackground";

export default function App() {
  const [player, setPlayer] = useState(null);

  return (
    <>
      {!player && <CookieBackground />}

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {!player ? (
          <Login onLogin={(user) => setPlayer(user)} />
        ) : (
          <Game player={player} onExit={() => setPlayer(null)} />
        )}
      </div>
    </>
  );
}
