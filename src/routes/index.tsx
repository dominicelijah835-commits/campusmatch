import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Users, MessageCircle, Home } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">CampMatch</span>
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-6 py-32 text-center text-white">
          <div className="animate-float-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Built for University of Calabar
          </div>
          <h1 className="animate-float-up mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] sm:text-6xl md:text-7xl" style={{ animationDelay: "0.1s" }}>
            Find Your Perfect <br />
            <span className="bg-gradient-to-r from-white via-primary-glow to-white bg-clip-text text-transparent">UNICAL Roommate.</span>
          </h1>
          <p className="animate-float-up mt-6 max-w-xl text-lg text-white/85" style={{ animationDelay: "0.2s" }}>
            Off-campus housing or Malabor hostel — match by lifestyle, study habits, and budget. No more random pairings.
          </p>
          <div className="animate-float-up mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.3s" }}>
            <Link
              to="/auth"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-primary shadow-elevated transition hover:scale-[1.03]"
            >
              Find Your Match
              <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              How it works
            </a>
          </div>

          <div className="animate-float-up mt-20 grid w-full max-w-3xl grid-cols-3 gap-6 text-left" style={{ animationDelay: "0.4s" }}>
            {[
              { k: "Main Gate", v: "Off-campus" },
              { k: "Small Gate", v: "Studios & flats" },
              { k: "Malabor", v: "Hostel rooms" },
            ].map((x) => (
              <div key={x.k} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-white/60">{x.v}</p>
                <p className="mt-1 font-display text-lg font-semibold">{x.k}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Three steps to your ideal flatmate</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, t: "Build your lifestyle profile", d: "Tell us your study habits, sleep cycle, budget, and preferred area." },
            { icon: Sparkles, t: "See your % match", d: "Our algorithm scores compatibility across every lifestyle metric." },
            { icon: MessageCircle, t: "Connect & chat", d: "Send a pitch, get accepted, and message in real time." },
          ].map((f, i) => (
            <div key={i} className="group rounded-3xl border bg-gradient-card p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-warm text-white">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-muted/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CampMatch · Built for UNICAL students
      </footer>
    </div>
  );
}
