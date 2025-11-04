import React, { useState } from "react";
import Login from "./components/Login";
import Game from "./components/Game";

export default function App() {
  const [player, setPlayer] = useState(null);

  return (
    <div className="container">
      {!player ? (
        <Login onLogin={(user) => setPlayer(user)} />
      ) : (
        <Game player={player} onExit={() => setPlayer(null)} />
      )}
    </div>
  );
}
