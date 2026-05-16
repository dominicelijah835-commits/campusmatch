import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Eye, EyeOff, LogOut, Loader2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchable, setSearchable] = useState(true);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setSearchable(data.is_searchable);
        setName(data.full_name ?? "");
        setBio(data.bio ?? "");
        setWhatsapp(data.whatsapp_number ?? "");
        setInstagram(data.instagram_handle ?? "");
        setTwitter(data.twitter_handle ?? "");
      }
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: name, bio, whatsapp_number: whatsapp, instagram_handle: instagram, twitter_handle: twitter, is_searchable: searchable,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Settings saved");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (loading) return <p className="py-20 text-center text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, visibility, and account.</p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              {searchable ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold">Discoverable in search</p>
              <p className="text-sm text-muted-foreground">When off, others can't see you in match results.</p>
            </div>
          </div>
          <button onClick={() => setSearchable(!searchable)} className={`relative h-7 w-12 rounded-full transition ${searchable ? "bg-gradient-warm" : "bg-muted"}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition ${searchable ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
      </Card>

      <Card title="Profile">
        <div className="space-y-4">
          <Input label="Full name" value={name} onChange={setName} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bio <span className="text-xs text-muted-foreground">({bio.length}/250)</span></label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 250))} rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
          <Input label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
          <Input label="Instagram" value={instagram} onChange={setInstagram} />
          <Input label="Twitter / X" value={twitter} onChange={setTwitter} />
          <div className="flex flex-wrap gap-2">
            <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </button>
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
              <Pencil className="h-4 w-4" /> Edit lifestyle & photo
            </Link>
          </div>
        </div>
      </Card>

      <Card title="Account">
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Card>
    </div>
  );
}

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
      {title && <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary" />
    </label>
  );
}
