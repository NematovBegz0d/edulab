import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronRight, Search } from "lucide-react";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "O'quvchilar — EduLens" }] }),
  component: () => (<ProtectedRoute><StudentsList /></ProtectedRoute>),
});

function StudentsList() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, class_number, class_letter, school_id, schools(name)")
        .order("full_name", { ascending: true });
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((s: any) =>
    !q || (s.full_name ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
              <Users className="h-7 w-7 text-primary" /> O'quvchilar
            </h1>
            <p className="mt-1 text-muted-foreground">Maslahatchi paneli — o'quvchilar ro'yxati va profillari.</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ism bo'yicha qidirish..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="flex items-center gap-4 p-4">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">O'quvchilar topilmadi.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((s: any) => (
              <Link
                key={s.id}
                to="/students/$id"
                params={{ id: s.id }}
                className="block"
              >
                <Card className="border-border/60 transition hover:border-primary/40 hover:shadow-md" style={{ boxShadow: "var(--shadow-card)" }}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {(s.full_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{s.full_name ?? "Noma'lum"}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.class_number ? `${s.class_number}-${s.class_letter ?? ""} sinf` : "Sinf kiritilmagan"}
                          {s.schools?.name ? ` • ${s.schools.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Profil</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}