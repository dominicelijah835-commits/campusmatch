import { useEffect, useState } from "react";
import { Home, Sparkles } from "lucide-react";

const STORAGE_KEY = "campmatch_intro_seen";

export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setShow(true);
    const leaveAt = setTimeout(() => setLeaving(true), 2600);
    const hideAt = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setShow(false);
    }, 3300);
    return () => {
      clearTimeout(leaveAt);
      clearTimeout(hideAt);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-gradient-hero transition-all duration-700 ${
        leaving ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center px-6 text-center text-white">
        <div className="animate-float-up grid h-20 w-20 place-items-center rounded-3xl bg-white/15 backdrop-blur-xl shadow-elevated ring-1 ring-white/20">
          <Home className="h-10 w-10" />
        </div>

        <h1
          className="animate-float-up mt-6 font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
          style={{ animationDelay: "0.15s" }}
        >
          Camp<span className="bg-gradient-to-r from-white via-primary-glow to-white bg-clip-text text-transparent">Match</span>
        </h1>

        <div
          className="animate-float-up mt-4 h-px w-40 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          style={{ animationDelay: "0.3s" }}
        />

        <p
          className="animate-float-up mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.35em] text-white/80"
          style={{ animationDelay: "0.45s" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Dominic EA
          <Sparkles className="h-3.5 w-3.5" />
        </p>

        <div className="animate-float-up mt-10 flex gap-1.5" style={{ animationDelay: "0.6s" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/80"
              style={{
                animation: "float-up 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
