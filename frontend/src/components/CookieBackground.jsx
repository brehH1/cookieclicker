import React, { useEffect } from "react";

export default function CookieBackground() {
  useEffect(() => {
    const container = document.querySelector(".cookie-bg");

    for (let i = 0; i < 25; i++) {
      const cookie = document.createElement("div");
      cookie.classList.add("cookie");
      cookie.style.left = Math.random() * 100 + "vw";
      cookie.style.animationDuration = 6 + Math.random() * 6 + "s";
      cookie.style.opacity = Math.random() * 0.7 + 0.3;
      cookie.style.fontSize = 24 + Math.random() * 24 + "px";
      container.appendChild(cookie);

      cookie.addEventListener("animationend", () => cookie.remove());
    }

    const interval = setInterval(() => {
      const cookie = document.createElement("div");
      cookie.classList.add("cookie");
      cookie.style.left = Math.random() * 100 + "vw";
      cookie.style.animationDuration = 6 + Math.random() * 6 + "s";
      cookie.style.opacity = Math.random() * 0.7 + 0.3;
      cookie.style.fontSize = 24 + Math.random() * 24 + "px";
      container.appendChild(cookie);
      cookie.addEventListener("animationend", () => cookie.remove());
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return <div className="cookie-bg"></div>;
}
