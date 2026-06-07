import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { ArrowLeft, Sparkles, ClipboardCheck, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/students/$id")({
  head: () => ({ meta: [{ title: "O'quvchi profili — EduLens" }] }),
  component: () => (<ProtectedRoute><StudentDetail /></ProtectedRoute>),
});

const fallbackRadar = [
  { skill: "Intellekt", value: 0 },
  { skill: "Ijodkorlik", value: 0 },
  { skill: "EQ", value: 0 },
  { skill: "Diqqat", value: 0 },
  { skill: "Liderlik", value: 0 },
  { skill: "Stress-chidamlilik", value: 0 },
];

function StudentDetail() {
  const { id } = Route.useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, schools(name, region, district)")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: studentProfile } = useQuery({
    queryKey: ["student-profile-extra", id],
    queryFn: async () => {
      const { data } = await supabase.from("student_profiles").select("*").eq("student_id", id).maybeSingle();
      return data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["student-results", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("test_results")
        .select("id, test_id, holland_code, personality_type, created_at, tests(name_uz, category)")
        .eq("student_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const radarData = (studentProfile?.radar_scores as any) ?? fallbackRadar;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Yuklanmoqda...</main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Link to="/students"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Orqaga</Button></Link>
          <Card className="mt-4"><CardContent className="p-10 text-center text-muted-foreground">O'quvchi topilmadi yoki ruxsat yo'q.</CardContent></Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/students"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />O'quvchilar ro'yxati</Button></Link>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {(profile.full_name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.full_name ?? "Noma'lum"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.class_number ? `${profile.class_number}-${profile.class_letter ?? ""} sinf` : "Sinf kiritilmagan"}
                {profile.schools?.name ? ` • ${profile.schools.name}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              To'liqlik: {studentProfile?.profile_completeness ?? 0}%
            </Badge>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              Testlar: {results?.length ?? 0}
            </Badge>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-foreground">Qobiliyatlar radari</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.9 0.01 247)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="oklch(0.546 0.215 262.9)" fill="oklch(0.546 0.215 262.9)" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold text-foreground">AI xulosa</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {studentProfile?.ai_summary ?? "Hozircha AI tahlili tayyor emas. O'quvchi testlarni yakunlagach, bu yerda shaxsiy xulosalar paydo bo'ladi."}
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Test natijalari</h2>
          </div>
          {(results ?? []).length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Hali test topshirilmagan.</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {(results ?? []).map((r: any) => (
                <Card key={r.id} className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold text-foreground">{r.tests?.name_uz ?? "Test"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("uz-UZ")}
                        {r.tests?.category ? ` • ${r.tests.category}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.holland_code && <Badge variant="secondary" className="bg-primary/10 text-primary">Holland: {r.holland_code}</Badge>}
                      {r.personality_type && <Badge variant="secondary" className="bg-secondary/10 text-secondary">{r.personality_type}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">Tavsiya etilgan kasblar</h2>
          </div>
          {Array.isArray(studentProfile?.top_careers) && studentProfile!.top_careers!.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(studentProfile!.top_careers as any[]).slice(0, 6).map((c: any, i: number) => (
                <Card key={i} className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{c.name_uz ?? c.name ?? `Kasb #${i + 1}`}</h4>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">#{i + 1}</span>
                    </div>
                    {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Tavsiyalar hali shakllanmagan.</CardContent></Card>
          )}
        </section>
      </main>
    </div>
  );
}