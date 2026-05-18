import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Waves, GraduationCap, MapPin, MessageCircle, Users, Home, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <header className="absolute inset-x-0 top-0 z-30 px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Waves className="h-4 w-4" />
            </div>
            <span className="font-display text-2xl italic leading-none">CampMatch</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-foreground/70 md:flex">
            <a href="#how" className="transition hover:text-foreground">How it works</a>
            <a href="#areas" className="transition hover:text-foreground">Areas</a>
            <a href="#trust" className="transition hover:text-foreground">Why us</a>
          </nav>
          <Link
            to="/auth"
            className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Sign in
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
          </Link>
        </div>
      </header>

      {/* HERO — Split screen */}
      <section className="relative min-h-[100svh] w-full">
        <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT — editorial */}
          <div className="relative flex flex-col justify-between px-6 pb-12 pt-32 sm:px-12 lg:px-16 lg:pt-40">
            <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/60 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Built in Calabar · For UNICAL
              </div>

              <h1 className="mt-7 font-display text-[clamp(2.8rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-tight text-primary">
                Your next <em className="italic">roommate</em><br />
                is one <span className="relative inline-block">
                  <span className="relative z-10 italic">match</span>
                  <span className="absolute inset-x-0 bottom-1.5 h-3 bg-primary-glow/60" />
                </span> away.
              </h1>

              <p className="mt-7 max-w-lg text-base leading-relaxed text-foreground/70 sm:text-lg">
                CampMatch pairs University of Calabar students by lifestyle, study habits, sleep cycle and budget — for off-campus flats around Marian, 8 Miles, Satellite Town and Malabor hostel rooms.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/auth"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:scale-[1.02]"
                >
                  Find your match
                  <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-7 py-4 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
                >
                  See how it works
                </a>
              </div>

              {/* Trust strip */}
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-foreground/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Verified UNICAL students
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  32+ Calabar neighborhoods
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Real-time chat
                </div>
              </div>
            </div>

            {/* Bottom meta row */}
            <div className="relative mt-16 hidden items-end justify-between border-t border-foreground/10 pt-6 text-xs uppercase tracking-[0.2em] text-foreground/50 lg:flex">
              <span>Edition 01 · 2026</span>
              <span>Calabar, Cross River</span>
            </div>
          </div>

          {/* RIGHT — visual stage */}
          <div className="relative overflow-hidden bg-gradient-hero">
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl" />

            {/* Decorative grid */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            <div className="relative flex h-full min-h-[60svh] flex-col justify-center px-8 py-20 sm:px-12 lg:px-16">
              {/* Floating match card */}
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -top-8 -left-6 hidden rotate-[-6deg] rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white backdrop-blur-md sm:block">
                  <p className="font-display text-lg italic leading-none">"Found my flatmate in 3 days."</p>
                  <p className="mt-2 text-white/70">— Aniefon, 300L Law</p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-elevated backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Compatibility</span>
                    <span className="rounded-full bg-primary-glow/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Top match</span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-warm font-display text-2xl italic text-white">
                      EU
                    </div>
                    <div>
                      <p className="font-display text-2xl italic text-white">Edidiong U.</p>
                      <p className="text-xs text-white/70">200L · Engineering · Marian</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-display text-6xl italic leading-none text-white">94</span>
                    <span className="pb-2 text-sm text-white/70">% match</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-primary-glow to-white" />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
                    {[
                      { k: "Sleep", v: "Night owl" },
                      { k: "Study", v: "Library" },
                      { k: "Budget", v: "₦80k" },
                    ].map((x) => (
                      <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                        <p className="uppercase tracking-wider text-white/50">{x.k}</p>
                        <p className="mt-0.5 font-semibold text-white">{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-4 hidden rotate-[5deg] rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white backdrop-blur-md sm:block">
                  <p className="font-display text-lg italic leading-none">Malabor · Block C</p>
                  <p className="mt-1 text-white/70">2 spots open · ₦65k/term</p>
                </div>
              </div>

              {/* Vertical ticker */}
              <div className="mt-14 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/60">
                <span>Marian</span>
                <span className="h-px flex-1 mx-4 bg-white/20" />
                <span>Satellite</span>
                <span className="h-px flex-1 mx-4 bg-white/20" />
                <span>Malabor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-foreground/10 px-6 py-24 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">The Process</p>
              <h2 className="mt-4 font-display text-5xl font-normal leading-[1] text-primary sm:text-6xl">
                Three steps. <em className="italic">Zero</em> random pairings.
              </h2>
              <p className="mt-5 max-w-md text-foreground/70">
                Built for the way UNICAL students actually live — from late-night CBT prep to weekend service runs.
              </p>
            </div>

            <ol className="space-y-5">
              {[
                { n: "01", icon: Users, t: "Build your lifestyle profile", d: "Study habits, sleep cycle, faith, cleanliness, budget and preferred area — answered in under 4 minutes." },
                { n: "02", icon: Sparkles, t: "See your % match score", d: "Our algorithm weighs every lifestyle metric and surfaces the students you'll actually vibe with." },
                { n: "03", icon: MessageCircle, t: "Pitch, accept, chat", d: "Send a short intro, wait for the green light, and message in real-time — all inside CampMatch." },
              ].map((s) => (
                <li key={s.n} className="group flex gap-5 rounded-3xl border border-foreground/10 bg-gradient-card p-6 transition hover:border-accent/40 hover:shadow-soft sm:p-8">
                  <span className="font-display text-3xl italic text-accent">{s.n}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <s.icon className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-2xl italic text-primary">{s.t}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section id="areas" className="bg-primary px-6 py-24 text-primary-foreground sm:px-12 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-glow">Where students live</p>
              <h2 className="mt-3 font-display text-5xl font-normal italic leading-[1] sm:text-6xl">Calabar, covered.</h2>
            </div>
            <p className="max-w-sm text-sm text-primary-foreground/70">From the Main Gate to Small Gate, MCC Road to Malabor — we map every student-dense corridor.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              "Marian", "Satellite Town", "8 Miles", "Ekorinim",
              "State Housing", "Atekong", "Parliamentary Rd", "Ikot Ansa",
              "MCC Road", "Diamond Hill", "Federal Housing", "Malabor Hostel",
            ].map((a) => (
              <div key={a} className="group flex items-center justify-between rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-4 backdrop-blur transition hover:border-primary-glow/60 hover:bg-primary-foreground/10">
                <span className="font-display text-lg italic">{a}</span>
                <ArrowUpRight className="h-4 w-4 text-primary-glow opacity-0 transition group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / STATS */}
      <section id="trust" className="px-6 py-24 sm:px-12 lg:px-16">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-3">
          {[
            { icon: GraduationCap, k: "UNICAL only", v: "Verified students", d: "Sign-up tied to a real UNICAL identity. No randos, no agents." },
            { icon: Home, k: "Calabar-native", v: "Built locally", d: "Areas, rent ranges and lingo tailored to actual Calabar life." },
            { icon: ShieldCheck, k: "Safe by design", v: "Mutual accept", d: "Both sides accept before chat opens. Your details stay yours." },
          ].map((s) => (
            <div key={s.k} className="rounded-3xl border border-foreground/10 bg-background p-8 transition hover:shadow-soft">
              <s.icon className="h-7 w-7 text-accent" />
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">{s.k}</p>
              <h3 className="mt-2 font-display text-3xl italic text-primary">{s.v}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-gradient-hero p-10 text-center text-primary-foreground sm:p-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-glow">Ready when you are</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-5xl font-normal leading-[1.02] sm:text-7xl">
            Stop rolling dice on <em className="italic">flatmates.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">Join the UNICAL students already pairing up for the new semester.</p>
          <Link
            to="/auth"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-8 py-4 text-sm font-semibold text-primary transition hover:scale-[1.03]"
          >
            Create my profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-foreground/10 px-6 py-10 text-sm text-foreground/60 sm:px-12 lg:px-16">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-accent" />
            <span className="font-display text-lg italic text-primary">CampMatch</span>
          </div>
          <p>© {new Date().getFullYear()} · Made in Calabar for UNICAL students</p>
        </div>
      </footer>
    </div>
  );
}
