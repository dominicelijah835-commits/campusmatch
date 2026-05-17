import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const KEY = "cm:lastReadAt";

function getReadMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function setReadMap(m: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(m));
  window.dispatchEvent(new Event("cm:read-updated"));
}

export function markConnectionRead(connectionId: string) {
  const m = getReadMap();
  m[connectionId] = new Date().toISOString();
  setReadMap(m);
}

export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const recompute = useCallback(async () => {
    if (!user) return setCount(0);
    const { data: conns } = await supabase
      .from("connections")
      .select("id")
      .eq("status", "accepted")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    const ids = (conns ?? []).map((c: any) => c.id);
    if (!ids.length) return setCount(0);
    const { data: msgs } = await supabase
      .from("messages")
      .select("connection_id,sender_id,created_at")
      .in("connection_id", ids)
      .neq("sender_id", user.id);
    const read = getReadMap();
    const unread = (msgs ?? []).filter(
      (m: any) => !read[m.connection_id] || new Date(m.created_at) > new Date(read[m.connection_id]),
    ).length;
    setCount(unread);
  }, [user]);

  useEffect(() => {
    recompute();
    if (!user) return;
    const ch = supabase
      .channel("unread-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, recompute)
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, recompute)
      .subscribe();
    const onRead = () => recompute();
    window.addEventListener("cm:read-updated", onRead);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("cm:read-updated", onRead);
    };
  }, [user, recompute]);

  return count;
}
