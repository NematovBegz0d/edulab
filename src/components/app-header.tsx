import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, ClipboardList, User as UserIcon, Users } from "lucide-react";

export function AppHeader() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isStaff = role === "counselor" || role === "admin";
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium bg-accent text-foreground" }}>
            <span className="inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Boshqaruv</span>
          </Link>
          <Link to="/my-tests" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium bg-accent text-foreground" }}>
            <span className="inline-flex items-center gap-2"><ClipboardList className="h-4 w-4" />Testlar</span>
          </Link>
          <Link to="/my-profile" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium bg-accent text-foreground" }}>
            <span className="inline-flex items-center gap-2"><UserIcon className="h-4 w-4" />Profil</span>
          </Link>
          {isStaff && (
            <Link to="/students" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium bg-accent text-foreground" }}>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />O'quvchilar</span>
            </Link>
          )}
        </nav>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />Chiqish
        </Button>
      </div>
    </header>
  );
}