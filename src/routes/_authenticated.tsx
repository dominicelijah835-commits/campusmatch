import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Compass, MessageCircle, Settings as SettingsIcon, Home, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useUnreadCount } from "@/lib/use-unread";

export const Route = createFileRoute("/_authenticated")({ component: Shell });

function Shell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadCount();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }

  const links = [
    { to: "/discover", label: "Discover", icon: Compass },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/discover" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-warm text-white"><Home className="h-5 w-5" /></div>
            <span className="font-display text-lg font-bold">CampMatch</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => {
              const active = path.startsWith(l.to);
              const showBadge = l.to === "/messages" && unread > 0;
              return (
                <Link key={l.to} to={l.to} className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <span className="relative">
                    <l.icon className="h-4 w-4" />
                    {showBadge && (
                      <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </span>
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={signOut} className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground md:inline-flex">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {links.map((l) => {
            const active = path.startsWith(l.to);
            const showBadge = l.to === "/messages" && unread > 0;
            return (
              <Link key={l.to} to={l.to} className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                <span className="relative">
                  <l.icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
