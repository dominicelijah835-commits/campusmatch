import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { matchScore, type Lifestyle } from "@/lib/match";
import { toast } from "sonner";
import { Search, Send, Clock, Instagram, Twitter, MessageCircle, MapPin, GraduationCap } from "lucide-react";
import { CALABAR_LOCATIONS } from "@/lib/locations";

export const Route = createFileRoute("/_authenticated/discover")({ component: Discover });

type ProfileRow = {
  id: string; full_name: string | null; department: string | null; level: string | null;
  gender: string | null; bio: string | null; avatar_url: string | null;
  instagram_handle: string | null; twitter_handle: string | null; whatsapp_number: string | null;
  onboarded: boolean;
};
type LifestyleRow = Lifestyle & { id: string };

function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [lifestyles, setLifestyles] = useState<Record<string, LifestyleRow>>({});
  const [myLifestyle, setMyLifestyle] = useState<Lifestyle | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [fLevel, setFLevel] = useState("");
  const [fGender, setFGender] = useState("");
  const [fLocation, setFLocation] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const me = await supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle();
      if (!me.data?.onboarded) { navigate({ to: "/onboarding" }); return; }

      const [{ data: ps }, { data: ls }, { data: cs }, { data: my }] = await Promise.all([
        supabase.from("profiles").select("*").neq("id", user.id),
        supabase.from("lifestyle_metrics").select("*"),
        supabase.from("connections").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from("lifestyle_metrics").select("*").eq("id", user.id).maybeSingle(),
      ]);
      setProfiles((ps as ProfileRow[]) ?? []);
      const lmap: Record<string, LifestyleRow> = {};
      (ls as LifestyleRow[] | null)?.forEach((l) => { lmap[l.id] = l; });
      setLifestyles(lmap);
      setMyLifestyle((my as Lifestyle) ?? null);

      const p = new Set<string>(); const a = new Set<string>();
      (cs ?? []).forEach((c: any) => {
        const other = c.sender_id === user.id ? c.receiver_id : c.sender_id;
        if (c.status === "pending") p.add(other);
        if (c.status === "accepted") a.add(other);
      });
      setPending(p); setAccepted(a);
      setLoading(false);
    })();
  }, [user, navigate]);

  const scored = useMemo(() => {
    if (!myLifestyle) return [];
    return profiles
      .map((p) => ({ p, score: matchScore(myLifestyle, lifestyles[p.id] ?? {}), life: lifestyles[p.id] }))
      .filter(({ p, life }) => {
        if (q && !`${p.full_name} ${p.department}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (fLevel && p.level !== fLevel) return false;
        if (fGender && p.gender !== fGender) return false;
        if (fLocation && life?.location_preference !== fLocation) return false;
        return p.onboarded;
      })
      .sort((a, b) => b.score - a.score);
  }, [profiles, lifestyles, myLifestyle, q, fLevel, fGender, fLocation]);

  const sendPitch = async (receiverId: string) => {
    if (!user) return;
    setPending((s) => new Set(s).add(receiverId));
    const { error } = await supabase.from("connections").insert({ sender_id: user.id, receiver_id: receiverId });
    if (error) { toast.error("Couldn't send request"); setPending((s) => { const n = new Set(s); n.delete(receiverId); return n; }); return; }
    toast.success("Connection pitch sent! 🚀");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Discover roommates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sorted by lifestyle compatibility</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border bg-card p-3 shadow-soft">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or department" className="h-11 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <FilterSelect value={fLevel} onChange={setFLevel} placeholder="Level" options={["100","200","300","400","500","600","Spillover"]} />
            <FilterSelect value={fGender} onChange={setFGender} placeholder="Gender" options={["Female","Male","Other"]} />
            <FilterSelect value={fLocation} onChange={setFLocation} placeholder="Location" options={[...CALABAR_LOCATIONS]} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">Loading matches…</div>
      ) : scored.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center shadow-soft">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted"><Search className="h-7 w-7 text-muted-foreground" /></div>
          <h3 className="mt-4 font-display text-xl font-semibold">No roommates match your criteria</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try widening your lifestyle filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scored.map(({ p, score, life }) => {
            const isPending = pending.has(p.id);
            const isAccepted = accepted.has(p.id);
            return (
              <article key={p.id} className="group animate-float-up overflow-hidden rounded-3xl border bg-gradient-card shadow-soft transition hover:-translate-y-1 hover:shadow-elevated">
                <div className="relative h-32 bg-gradient-hero">
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur">
                    {score}% Match
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="-mt-10 mb-3 h-20 w-20 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-soft">
                    {p.avatar_url ? <img src={p.avatar_url} alt={p.full_name ?? ""} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center font-display text-2xl text-muted-foreground">{p.full_name?.[0] ?? "?"}</div>}
                  </div>
                  <h3 className="font-display text-lg font-bold">{p.full_name || "Unnamed"}</h3>
                  <p className="text-sm text-muted-foreground">{p.department}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    {p.level && <Badge icon={<GraduationCap className="h-3 w-3" />}>{p.level} Level</Badge>}
                    {life?.location_preference && <Badge icon={<MapPin className="h-3 w-3" />}>{life.location_preference}</Badge>}
                    {life?.study_habit && <Badge>{life.study_habit}</Badge>}
                    {life?.sleep_cycle && <Badge>{life.sleep_cycle}</Badge>}
                  </div>

                  {p.bio && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.bio}</p>}

                  <div className="mt-3 flex gap-2 text-muted-foreground">
                    {p.instagram_handle && <Instagram className="h-4 w-4" />}
                    {p.twitter_handle && <Twitter className="h-4 w-4" />}
                    {p.whatsapp_number && <MessageCircle className="h-4 w-4" />}
                  </div>

                  {isAccepted ? (
                    <Link to="/messages" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground">
                      <MessageCircle className="h-4 w-4" /> Message
                    </Link>
                  ) : isPending ? (
                    <button disabled className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground">
                      <Clock className="h-4 w-4" /> Request Pending
                    </button>
                  ) : (
                    <button onClick={() => sendPitch(p.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-warm px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-95">
                      <Send className="h-4 w-4" /> Send Connection Pitch
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">{icon}{children}</span>;
}

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
