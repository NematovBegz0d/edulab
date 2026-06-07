import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardList, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Boshqaruv paneli — EduLens" }] }),
  component: () => (<ProtectedRoute><Dashboard /></ProtectedRoute>),
});

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const { data: sessions } = useQuery({
    queryKey: ["sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("test_sessions").select("id, status, test_id, completed_at, tests(name_uz)").eq("student_id", user!.id).order("started_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: tests } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const { data } = await supabase.from("tests").select("*").eq("is_active", true).limit(3);
      return data ?? [];
    },
  });

  const completedCount = (sessions ?? []).filter((s) => s.status === "completed").length;
  const inProgress = (sessions ?? []).filter((s) => s.status === "in_progress").length;
  const completeness = Math.min(100, Math.round((completedCount / 8) * 100));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Assalomu alaykum, {profile?.full_name?.split(" ")[0] ?? "do'st"}!
          </h1>
          <p className="mt-1 text-muted-foreground">Bugun qaysi qobiliyatingizni kashf qilamiz?</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Yechilgan testlar" value={completedCount} icon={CheckCircle2} accent="success" />
          <StatCard label="Davom etmoqda" value={inProgress} icon={ClipboardList} accent="warning" />
          <StatCard label="Profil to'liqligi" value={`${completeness}%`} icon={Sparkles} accent="primary" />
        </div>

        <Card className="mt-6 border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Profilingiz to'liqligi</h3>
                <p className="text-sm text-muted-foreground">Barcha testlarni yeching va aniq tavsiyalar oling</p>
              </div>
              <span className="text-2xl font-bold text-primary">{completeness}%</span>
            </div>
            <Progress value={completeness} className="mt-4" />
          </CardContent>
        </Card>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Tavsiya etilgan testlar</h2>
            <Button asChild variant="ghost"><Link to="/my-tests">Hammasi <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(tests ?? []).map((t) => (
              <Card key={t.id} className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground">{t.name_uz}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                  <Button asChild size="sm" className="mt-4 w-full"><Link to="/test/$id" params={{ id: t.id }}>Boshlash</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}