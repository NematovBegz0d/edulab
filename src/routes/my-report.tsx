import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { AISummary } from "@/components/ai-summary";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Printer, ArrowLeft, Briefcase } from "lucide-react";

export const Route = createFileRoute("/my-report")({
  head: () => ({ meta: [{ title: "Hisobot — EduLens" }] }),
  component: () => (<ProtectedRoute><MyReport /></ProtectedRoute>),
});

interface RadarItem { skill: string; value: number }
interface IqItem { type: string; score: number }
interface TopCareer { id: string; name_uz: string; description: string | null; required_skills: string[]; salary_range: string | null }

function MyReport() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["report-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, class_number, class_letter, schools(name)").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: sp } = useQuery({
    queryKey: ["report-sp", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("student_profiles")
        .select("radar_scores, iq_scores, top_careers, ai_summary, profile_completeness")
        .eq("student_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["report-results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("test_results").select("holland_code, personality_type").eq("student_id", user!.id);
      return data ?? [];
    },
  });

  const radarData = (sp?.radar_scores as RadarItem[] | null) ?? [];
  const iqData = (sp?.iq_scores as IqItem[] | null) ?? [];
  const topCareers = (sp?.top_careers as TopCareer[] | null) ?? [];
  const aiSummary = (sp?.ai_summary as string | null) ?? null;
  const completeness = sp?.profile_completeness ?? 0;
  const hollandCode = results?.find((r) => r.holland_code)?.holland_code ?? null;
  const temperament = results?.find((r) => r.personality_type)?.personality_type ?? null;
  const today = new Date().toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Print sozlamalari */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      {/* Boshqaruv paneli (chop etilmaydi) */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <Button asChild variant="ghost" size="sm"><Link to="/my-profile"><ArrowLeft className="mr-1.5 h-4 w-4" />Profilga qaytish</Link></Button>
        <Button size="sm" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" />PDF / Chop etish</Button>
      </div>

      {/* Hisobot varagʻi */}
      <div className="report-sheet mx-auto my-6 max-w-3xl rounded-lg bg-white p-8 shadow-lg md:p-10">
        {/* Sarlavha */}
        <div className="flex items-center justify-between border-b pb-5">
          <Logo />
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">Psixometrik hisobot</p>
            <p className="text-xs text-slate-400">{today}</p>
          </div>
        </div>

        {/* Oʻquvchi maʼlumoti */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name ?? "Oʻquvchi"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile?.class_number ? `${profile.class_number}-${profile.class_letter ?? ""} sinf` : ""}
            {(profile?.schools as { name?: string } | null)?.name ? ` • ${(profile!.schools as { name?: string }).name}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {hollandCode && <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-600">Holland: {hollandCode}</span>}
            {temperament && <span className="rounded-full bg-purple-50 px-3 py-1 font-semibold text-purple-600">Temperament: {temperament}</span>}
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">Profil toʻliqligi: {completeness}%</span>
          </div>
        </div>

        {/* Grafiklar */}
        {radarData.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Asosiy qobiliyatlar</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.35} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {iqData.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">IQ koʻrsatkichlari</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={iqData}>
                      <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                      <YAxis domain={[60, 140]} tick={{ fontSize: 10 }} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#7C3AED" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mos kasblar */}
        {topCareers.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
              <Briefcase className="h-4 w-4 text-indigo-600" /> Sizga mos kasblar
            </h3>
            <div className="space-y-2">
              {topCareers.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.name_uz}</p>
                    {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                    {c.salary_range && <p className="mt-0.5 text-xs text-slate-400">Maosh: {c.salary_range}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI tahlil */}
        {aiSummary && (
          <div className="mt-8 border-t pt-6">
            <h3 className="mb-3 text-base font-semibold text-slate-800">AI tahlili</h3>
            <AISummary text={aiSummary} />
          </div>
        )}

        {/* Boʻsh holat */}
        {radarData.length === 0 && !aiSummary && (
          <div className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
            Hisobot uchun maʼlumot yetarli emas. Avval testlarni yakunlang.
          </div>
        )}

        {/* Izoh */}
        <p className="mt-10 border-t pt-4 text-center text-[11px] leading-relaxed text-slate-400">
          Ushbu hisobot EduLens platformasi tomonidan psixologik testlar asosida shakllantirildi.
          Natijalar maslahat xarakteriga ega — yakuniy qaror pedagog-psixolog tasdigʻi bilan qabul qilinadi.
        </p>
      </div>
    </div>
  );
}
