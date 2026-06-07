import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Sparkles, GraduationCap, Briefcase, Award, Inbox } from "lucide-react";

export const Route = createFileRoute("/my-profile")({
  head: () => ({ meta: [{ title: "Mening profilim — EduLens" }] }),
  component: () => (<ProtectedRoute><MyProfile /></ProtectedRoute>),
});

interface RadarItem { skill: string; value: number }
interface IqItem { type: string; score: number }
interface TopCareer {
  id: string;
  name_uz: string;
  description: string | null;
  required_skills: string[];
  salary_range: string | null;
  universities?: { name: string; city?: string }[];
}

function MyProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Yig'ma psixometrik profil (Edge Function tomonidan to'ldiriladi)
  const { data: sp, isLoading: spLoading } = useQuery({
    queryKey: ["student-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("student_profiles")
        .select("radar_scores, iq_scores, top_careers, profile_completeness")
        .eq("student_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Holland kodi va temperament (badge uchun) — test natijalaridan
  const { data: results } = useQuery({
    queryKey: ["my-results-meta", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("test_results")
        .select("holland_code, personality_type")
        .eq("student_id", user!.id);
      return data ?? [];
    },
  });

  const { data: careersFallback, error: careersError } = useQuery({
    queryKey: ["careers-top"],
    queryFn: async () => {
      const { data, error } = await supabase.from("careers").select("*").limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (careersError) toast.error("Kasblar ro'yxatini yuklab bo'lmadi");
  }, [careersError]);

  const radarData = (sp?.radar_scores as RadarItem[] | null) ?? [];
  const iqData = (sp?.iq_scores as IqItem[] | null) ?? [];
  const topCareers = (sp?.top_careers as TopCareer[] | null) ?? [];
  const completeness = sp?.profile_completeness ?? 0;
  const hollandCode = results?.find((r) => r.holland_code)?.holland_code ?? null;
  const temperament = results?.find((r) => r.personality_type)?.personality_type ?? null;
  const hasData = radarData.length > 0;

  // Kasblar: yig'ma profildagi top kasblar bo'lsa o'shani, bo'lmasa umumiy ro'yxat
  const displayCareers: TopCareer[] = topCareers.length > 0
    ? topCareers
    : (careersFallback ?? []).map((c) => ({
        id: c.id,
        name_uz: c.name_uz,
        description: c.description,
        required_skills: c.required_skills ?? [],
        salary_range: c.salary_range,
      }));

  // OTM ro'yxati — top kasblardagi universitetlardan yig'iladi
  const universities = Array.from(
    new Map(
      topCareers
        .flatMap((c) => c.universities ?? [])
        .map((u) => [u.name, u]),
    ).values(),
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {profileLoading ? (
              <Skeleton className="h-9 w-56" />
            ) : (
              <h1 className="text-3xl font-bold text-foreground">{profile?.full_name ?? "Profil"}</h1>
            )}
            <p className="mt-1 text-muted-foreground">Shaxsiy psixometrik profilingiz</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hollandCode && <Badge variant="secondary" className="bg-primary/10 text-primary">Holland: {hollandCode}</Badge>}
            {temperament && <Badge variant="secondary" className="bg-secondary/10 text-secondary">Temperament: {temperament}</Badge>}
            <Badge variant="outline">Profil: {completeness}%</Badge>
          </div>
        </div>

        {/* Hali test yechilmagan bo'lsa — bo'sh holat */}
        {!spLoading && !hasData && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Profilingiz hali bo'sh</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Kamida bitta testni yakunlang — natijalaringiz shu yerda radar grafik va kasb tavsiyalari ko'rinishida paydo bo'ladi.
              </p>
              <Button asChild className="mt-2"><Link to="/my-tests">Test yechishni boshlash</Link></Button>
            </CardContent>
          </Card>
        )}

        {hasData && (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold text-foreground">Asosiy qobiliyatlar</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="oklch(0.9 0.01 247)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: "oklch(0.95 0.02 262.9 / 0.4)" }}
                          contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 247)", fontSize: 12 }}
                          formatter={(v: number) => [`${v}/100`, "Ball"]}
                        />
                        <Radar dataKey="value" stroke="oklch(0.546 0.215 262.9)" fill="oklch(0.546 0.215 262.9)" fillOpacity={0.35} isAnimationActive animationDuration={800} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold text-foreground">IQ ko'rsatkichlari</h3>
                  {iqData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={iqData}>
                          <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} domain={[60, 140]} />
                          <Tooltip
                            cursor={{ fill: "oklch(0.95 0.03 296.8 / 0.4)" }}
                            contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 247)", fontSize: 12 }}
                            formatter={(v: number) => [v, "IQ"]}
                          />
                          <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="oklch(0.534 0.246 296.8)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-80 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                      <p>IQ ko'rsatkichlari uchun</p>
                      <p>Raven yoki Matematik IQ testini yeching.</p>
                      <Button asChild size="sm" variant="outline" className="mt-2"><Link to="/my-tests">IQ testi</Link></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-foreground">AI xulosa</h3>
                  <Badge variant="outline" className="ml-2 text-xs">Tez orada</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sun'iy intellekt tahlili 3-5 ta test yakunlanganda avtomatik shakllanadi va bu yerda
                  kuchli tomonlaringiz, rivojlanish sohalari hamda 6 oylik reja ko'rinishida paydo bo'ladi.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* TOP kasblar */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              {topCareers.length > 0 ? "Sizga mos TOP kasblar" : "Mashhur kasblar"}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayCareers.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 border-dashed">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Inbox className="h-6 w-6" /></div>
                  <p className="text-sm text-muted-foreground">Hozircha tavsiyalar yo'q. Holland testini yakunlang.</p>
                  <Button asChild size="sm"><Link to="/my-tests">Testlarga o'tish</Link></Button>
                </CardContent>
              </Card>
            ) : (
              displayCareers.slice(0, 5).map((c, i) => (
                <Card key={c.id} className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground transition-colors group-hover:text-primary">{c.name_uz}</h4>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">#{i + 1}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(c.required_skills ?? []).slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    {c.salary_range && (
                      <p className="mt-3 text-xs text-muted-foreground"><Award className="mr-1 inline h-3.5 w-3.5" />{c.salary_range}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* TOP universitetlar (mos kasblardan) */}
        {universities.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              <h2 className="text-xl font-semibold text-foreground">Tavsiya etilgan oliygohlar</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {universities.map((u, i) => (
                <Card key={u.name} className="group border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-xl" style={{ boxShadow: "var(--shadow-card)" }}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground transition-colors group-hover:text-secondary">{u.name}</h4>
                      <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">#{i + 1}</span>
                    </div>
                    {u.city && <p className="mt-2 text-xs text-muted-foreground">📍 {u.city}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
