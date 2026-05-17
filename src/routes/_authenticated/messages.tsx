import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Send, Check, X, MessageCircle } from "lucide-react";
import { markConnectionRead } from "@/lib/use-unread";

export const Route = createFileRoute("/_authenticated/messages")({ component: Messages });

interface Conn { id: string; sender_id: string; receiver_id: string; status: string; created_at: string; other?: ProfileLite; }
interface ProfileLite { id: string; full_name: string | null; avatar_url: string | null; department: string | null; }
interface Msg { id: string; connection_id: string; sender_id: string; message_text: string; created_at: string; }

function Messages() {
  const { user } = useAuth();
  const [conns, setConns] = useState<Conn[]>([]);
  const [pendingIn, setPendingIn] = useState<Conn[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: cs } = await supabase.from("connections").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const otherIds = Array.from(new Set((cs ?? []).map((c: any) => c.sender_id === user.id ? c.receiver_id : c.sender_id)));
      const { data: ps } = otherIds.length
        ? await supabase.from("profiles").select("id,full_name,avatar_url,department").in("id", otherIds)
        : { data: [] };
      const pmap = new Map((ps ?? []).map((p: any) => [p.id, p]));
      const enriched: Conn[] = (cs ?? []).map((c: any) => ({ ...c, other: pmap.get(c.sender_id === user.id ? c.receiver_id : c.sender_id) }));
      setConns(enriched.filter((c) => c.status === "accepted"));
      setPendingIn(enriched.filter((c) => c.status === "pending" && c.receiver_id === user.id));
    };
    load();

    const ch = supabase.channel("conns-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    supabase.from("messages").select("*").eq("connection_id", activeId).order("created_at").then(({ data }) => {
      setMsgs((data as Msg[]) ?? []);
      markConnectionRead(activeId);
    });
    const ch = supabase.channel(`msgs-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `connection_id=eq.${activeId}` },
        (payload) => {
          setMsgs((m) => [...m, payload.new as Msg]);
          markConnectionRead(activeId);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!user || !activeId || !text.trim()) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ connection_id: activeId, sender_id: user.id, message_text: body });
    if (error) toast.error("Couldn't send");
  };

  const respond = async (id: string, status: "accepted" | "rejected") => {
    const { error } = await supabase.from("connections").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "accepted" ? "Connection accepted!" : "Request declined");
  };

  const active = conns.find((c) => c.id === activeId);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border bg-card shadow-soft">
        {pendingIn.length > 0 && (
          <div className="border-b p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending requests</h3>
            <div className="space-y-2">
              {pendingIn.map((c) => (
                <div key={c.id} className="flex items-center gap-2 rounded-xl bg-muted/50 p-2">
                  <Avatar p={c.other} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.other?.full_name}</p>
                  </div>
                  <button onClick={() => respond(c.id, "accepted")} className="grid h-8 w-8 place-items-center rounded-full bg-success text-success-foreground hover:opacity-90"><Check className="h-4 w-4" /></button>
                  <button onClick={() => respond(c.id, "rejected")} className="grid h-8 w-8 place-items-center rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Conversations</h3>
          {conns.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No accepted connections yet.</p>
          ) : (
            <div className="space-y-1">
              {conns.map((c) => (
                <button key={c.id} onClick={() => setActiveId(c.id)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${activeId === c.id ? "bg-primary/10" : "hover:bg-muted"}`}>
                  <Avatar p={c.other} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.other?.full_name ?? "User"}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.other?.department}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <section className="flex h-[calc(100svh-12rem)] flex-col rounded-2xl border bg-card shadow-soft">
        {!active ? (
          <div className="grid flex-1 place-items-center text-center text-muted-foreground">
            <div>
              <MessageCircle className="mx-auto h-10 w-10" />
              <p className="mt-2">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b p-4">
              <Avatar p={active.other} />
              <div>
                <p className="font-semibold">{active.other?.full_name}</p>
                <p className="text-xs text-muted-foreground">{active.other?.department}</p>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              {msgs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Say hi! 👋</p>
              ) : (
                <div className="space-y-2">
                  {msgs.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex animate-float-up ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-gradient-warm text-white rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                          {m.message_text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary" />
              <button type="submit" className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-warm text-white shadow-soft hover:opacity-95"><Send className="h-4 w-4" /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function Avatar({ p }: { p?: ProfileLite }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
      {p?.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="font-display text-sm font-semibold text-muted-foreground">{p?.full_name?.[0] ?? "?"}</span>}
    </div>
  );
}
