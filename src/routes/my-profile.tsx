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

// Demo / mock data — keyin AI tahlilidan keladi
const radarData = [
  { skill: "Intellekt", value: 78 },
  { skill: "Ijodkorlik", value: 65 },
  { skill: "EQ", value: 72 },
  { skill: "Diqqat", value: 68 },
  { skill: "Liderlik", value: 55 },
  { skill: "Stress-chidamlilik", value: 70 },
];
const iqData = [
  { type: "Umumiy", score: 115 },
  { type: "Matematik", score: 122 },
  { type: "Verbal", score: 108 },
  { type: "Vizual", score: 118 },
];

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
  const { data: careers, isLoading: careersLoading, error: careersError } = useQuery({
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

  const universities = [
    { name: "TATU", direction: "Dasturiy injiniring", city: "Toshkent" },
    { name: "Inha University", direction: "Computer Science", city: "Toshkent" },
    { name: "TDIU", direction: "Iqtisodiyot", city: "Toshkent" },
    { name: "WIUT", direction: "Business Management", city: "Toshkent" },
    { name: "O'zMU", direction: "Amaliy matematika", city: "Toshkent" },
  ];

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
            <Badge variant="secondary" className="bg-primary/10 text-primary">Holland: RIA</Badge>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">MBTI: INTJ</Badge>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-foreground">6 ta asosiy qobiliyat</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.9 0.01 247)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(0.95 0.02 262.9 / 0.4)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid oklch(0.92 0.01 247)",
                        boxShadow: "0 10px 30px -10px oklch(0.546 0.215 262.9 / 0.25)",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v}/100`, "Ball"]}
                    />
                    <Radar
                      dataKey="value"
                      stroke="oklch(0.546 0.215 262.9)"
                      fill="oklch(0.546 0.215 262.9)"
                      fillOpacity={0.35}
                      isAnimationActive
                      animationDuration={800}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-foreground">IQ ko'rsatkichlari</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={iqData}>
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[60, 140]} />
                    <Tooltip
                      cursor={{ fill: "oklch(0.95 0.03 296.8 / 0.4)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid oklch(0.92 0.01 247)",
                        boxShadow: "0 10px 30px -10px oklch(0.534 0.246 296.8 / 0.25)",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [v, "IQ"]}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="oklch(0.534 0.246 296.8)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">AI xulosa</h3>
              <Badge variant="outline" className="ml-2 text-xs">Demo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Sizning natijalaringizga ko'ra: <span className="font-medium text-foreground">analitik fikrlash</span> va{" "}
              <span className="font-medium text-foreground">tadqiqotchilik</span> kuchli tomonlaringiz. Ijodkorlik va liderlikni rivojlantirish foydali bo'lardi. 6 oylik reja: matematik olimpiadalarda qatnashing, dasturlash kursini boshlang va guruh loyihalarda yetakchilik qiling.
            </p>
          </CardContent>
        </Card>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">TOP 5 mos kasb</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {careersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-14" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (careers ?? []).length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 border-dashed">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">Hozircha tavsiyalar yo'q. Testlarni yakunlang.</p>
                  <Button asChild size="sm"><Link to="/my-tests">Testlarga o'tish</Link></Button>
                </CardContent>
              </Card>
            ) : (
              (careers ?? []).slice(0, 5).map((c, i) => (
              <Card
                key={c.id}
                className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
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
                    <p className="mt-3 text-xs text-muted-foreground">
                      <Award className="mr-1 inline h-3.5 w-3.5" />{c.salary_range}
                    </p>
                  )}
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">TOP 5 oliy o'quv yurti</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((u, i) => (
              <Card
                key={u.name}
                className="group border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-xl"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground transition-colors group-hover:text-secondary">{u.name}</h4>
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">#{i + 1}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{u.direction}</p>
                  <p className="mt-2 text-xs text-muted-foreground">📍 {u.city}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}