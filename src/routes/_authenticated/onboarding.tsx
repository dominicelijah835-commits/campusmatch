import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Upload, Check, Loader2, ChevronRight, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({ component: Onboarding });

const LEVELS = ["100", "200", "300", "400", "500", "600", "Spillover"];
const GENDERS = ["Female", "Male", "Other"];
const STUDY = ["Quiet", "Flexible"];
const SLEEP = ["Early Bird", "Night Owl"];
const GUESTS = ["Open to Guests", "No Guests"];
const LOCATIONS = ["Main Gate", "Small Gate", "Duke Town", "Malabor"];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [studyHabit, setStudyHabit] = useState("");
  const [sleepCycle, setSleepCycle] = useState("");
  const [guestPolicy, setGuestPolicy] = useState("");
  const [budget, setBudget] = useState<[number, number]>([100000, 300000]);
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setDepartment(data.department ?? "");
        setLevel(data.level ?? "");
        setGender(data.gender ?? "");
        setBio(data.bio ?? "");
        setWhatsapp(data.whatsapp_number ?? "");
        setInstagram(data.instagram_handle ?? "");
        setTwitter(data.twitter_handle ?? "");
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
    });
  }, [user]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("Max file size allowed is 8MB"); return; }
    if (!f.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatar_url = avatarPreview;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: uErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uErr) throw uErr;
        avatar_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      const { error: pErr } = await supabase.from("profiles").upsert({
        id: user.id, full_name: fullName, department, level, gender, bio,
        whatsapp_number: whatsapp, instagram_handle: instagram, twitter_handle: twitter,
        avatar_url, onboarded: true,
      });
      if (pErr) throw pErr;

      const { error: lErr } = await supabase.from("lifestyle_metrics").upsert({
        id: user.id, study_habit: studyHabit, sleep_cycle: sleepCycle, guest_policy: guestPolicy,
        budget_min: budget[0], budget_max: budget[1], location_preference: location,
      });
      if (lErr) throw lErr;

      toast.success("Profile saved!");
      navigate({ to: "/discover" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  };

  const canNext = step === 1
    ? fullName && department && level && gender
    : step === 2
    ? studyHabit && sleepCycle && guestPolicy && location
    : true;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step {step} of 3</span>
          <div className="flex flex-1 gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-gradient-warm" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold">
          {step === 1 ? "Tell us about you" : step === 2 ? "Your lifestyle" : "Stay in touch"}
        </h1>
      </div>

      <div className="rounded-3xl border bg-gradient-card p-6 shadow-soft md:p-8 animate-float-up">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Profile photo</label>
              <label
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                onDragOver={(e) => e.preventDefault()}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-background p-4 transition hover:border-primary"
              >
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
                  {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : <Upload className="h-7 w-7 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">Max file size allowed is 8MB · JPG / PNG</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            <Row><Input label="Full name" value={fullName} onChange={setFullName} placeholder="Your name" /></Row>
            <Row><Input label="Department" value={department} onChange={setDepartment} placeholder="e.g. Computer Science" /></Row>
            <Row>
              <Select label="Level" value={level} onChange={setLevel} options={LEVELS} />
              <Select label="Gender" value={gender} onChange={setGender} options={GENDERS} />
            </Row>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bio <span className="text-xs text-muted-foreground">({bio.length}/250)</span></label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 250))} rows={3} placeholder="A little about you, your hobbies, what you're looking for…" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <PillGroup label="Study habit" value={studyHabit} onChange={setStudyHabit} options={STUDY} />
            <PillGroup label="Sleep cycle" value={sleepCycle} onChange={setSleepCycle} options={SLEEP} />
            <PillGroup label="Guest policy" value={guestPolicy} onChange={setGuestPolicy} options={GUESTS} />
            <PillGroup label="Preferred area" value={location} onChange={setLocation} options={LOCATIONS} />

            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium">Monthly budget</label>
                <span className="font-display text-sm font-semibold text-primary">₦{budget[0].toLocaleString()} – ₦{budget[1].toLocaleString()}</span>
              </div>
              <div className="mt-3 space-y-2">
                <input type="range" min={20000} max={1000000} step={10000} value={budget[0]} onChange={(e) => setBudget([+e.target.value, Math.max(+e.target.value, budget[1])])} className="w-full accent-[oklch(0.62_0.22_24)]" />
                <input type="range" min={20000} max={1000000} step={10000} value={budget[1]} onChange={(e) => setBudget([Math.min(+e.target.value, budget[0]), +e.target.value])} className="w-full accent-[oklch(0.62_0.22_24)]" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Input label="WhatsApp number" value={whatsapp} onChange={setWhatsapp} placeholder="+234…" />
            <Input label="Instagram handle" value={instagram} onChange={setInstagram} placeholder="@yourhandle" />
            <Input label="Twitter / X handle" value={twitter} onChange={setTwitter} placeholder="@yourhandle" />
            <p className="text-xs text-muted-foreground">These are optional and only shown to people you've matched with.</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}
          {step < 3 ? (
            <button disabled={!canNext} onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1 rounded-full bg-gradient-warm px-6 py-2.5 text-sm font-semibold text-white shadow-elevated disabled:opacity-50">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-6 py-2.5 text-sm font-semibold text-white shadow-elevated disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2">{children}</div>; }

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function PillGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o;
          return (
            <button key={o} type="button" onClick={() => onChange(o)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-transparent bg-gradient-warm text-white shadow-soft" : "border-border bg-background hover:border-primary"}`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
