import { useEffect, useRef, useState } from "react";

// The site's recurring visual signature: a circular "infusion" ring that fills as
// tea steeps. Doubles as a literal, usable brew timer on every product page.
export default function BrewRing({ brewTimeSeconds, size = 180 }) {
  const [remaining, setRemaining] = useState(brewTimeSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(brewTimeSeconds);
    setRunning(false);
  }, [brewTimeSeconds]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - remaining / brewTimeSeconds;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  function toggle() {
    if (remaining === 0) setRemaining(brewTimeSeconds);
    setRunning((r) => !r);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8DCC0"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#B98D2E"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <button
          onClick={toggle}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500"
          aria-label={running ? "Pause brew timer" : "Start brew timer"}
        >
          <span className="font-display text-2xl text-bottle-900">
            {minutes}:{seconds}
          </span>
          <span className="eyebrow mt-1">{running ? "Steeping…" : remaining === 0 ? "Ready" : "Start"}</span>
        </button>
      </div>
    </div>
  );
}
