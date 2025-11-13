import { useEffect } from "react";

export default function MusicPlayer() {
  useEffect(() => {
    const audio = new Audio("/music.mp3");
    audio.volume = 0.5;
    audio.loop = true;

    const startMusic = () => {
      audio.play().catch(err => console.log("Autoplay blocked:", err));
      document.removeEventListener("click", startMusic);
    };

    document.addEventListener("click", startMusic);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);


  return null;
}
