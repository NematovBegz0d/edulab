import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/my-results")({
  head: () => ({ meta: [{ title: "Mening natijalarim — EduLens" }] }),
  component: () => (<ProtectedRoute><MyResults /></ProtectedRoute>),
});

function MyResults() {
  const { user } = useAuth();
  const { data: results, isLoading } = useQuery({
    queryKey: ["results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("test_sessions").select("id, status, completed_at, tests(name_uz)").eq("student_id", user!.id).eq("status", "completed").order("completed_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Mening natijalarim</h1>
        <div className="mt-6 grid gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (results ?? []).length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Hozircha tugatilgan testlar yo'q. <Link to="/my-tests" className="text-primary">Test yechishni boshlang →</Link></CardContent></Card>
          ) : (
            results!.map((r) => (
              <Card key={r.id} className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">{(r.tests as { name_uz: string } | null)?.name_uz}</p>
                      <p className="text-xs text-muted-foreground">{r.completed_at ? new Date(r.completed_at).toLocaleDateString("uz-UZ") : ""}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm"><Link to="/my-profile">Ko'rish</Link></Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}