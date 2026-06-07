import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Brain, Target, Users, ArrowRight, Check, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduLens — Kasbga yo'naltirish platformasi" },
      { name: "description", content: "9-sinf o'quvchilari uchun psixologik testlar orqali shaxsiyat, intellekt va kasb tavsiyalari." },
      { property: "og:title", content: "EduLens — Kelajagingizni kashf eting" },
      { property: "og:description", content: "Ilmiy testlar bilan o'zingizga mos kasb va oliy ta'lim yo'nalishini toping." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Kirish</Link>
          <Link
            to="/auth"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
          >
            Boshlash
          </Link>
        </div>
      </header>

      <main className="px-4 pb-24 pt-12 md:px-8 md:pt-20">
        {/* Hero */}
        <section className="mx-auto mb-24 max-w-6xl text-center md:mb-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
            9-sinf o'quvchilari uchun
          </div>

          <h1 className="mb-8 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Kelajakdagi kasbingizni
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              ilm bilan toping
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            EduLens — psixologik va intellektual testlar orqali shaxsiyatingiz, qobiliyatingiz va qiziqishingizga eng mos kasb hamda oliy ta'lim yo'nalishini tavsiya qiladi.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              to="/auth"
              className="group flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-indigo-700 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
            >
              Bepul boshlash
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="text-sm font-medium text-slate-500">15+ daqiqada birinchi natija</span>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto mb-24 grid max-w-7xl grid-cols-1 gap-8 md:mb-32 md:grid-cols-3">
          {[
            {
              icon: Brain,
              iconBg: "bg-blue-50",
              iconText: "text-blue-600",
              iconHover: "group-hover:bg-blue-600",
              title: "8 ta ilmiy test",
              text: "Holland, Ayzenk, Big Five, Raven IQ va boshqalar — xalqaro standartlar asosida.",
            },
            {
              icon: Target,
              iconBg: "bg-purple-50",
              iconText: "text-purple-600",
              iconHover: "group-hover:bg-purple-600",
              title: "Aniq tavsiyalar",
              text: "Sizga mos TOP 5 kasb va TOP 5 universitet — shaxsiy interaktiv hisobotda.",
            },
            {
              icon: Users,
              iconBg: "bg-indigo-50",
              iconText: "text-indigo-600",
              iconHover: "group-hover:bg-indigo-600",
              title: "Maslahatchi yordami",
              text: "Maktab psixologi natijalaringizni kuzatib boradi va to'g'ri yo'nalish ko'rsatadi.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} ${f.iconText} transition-colors ${f.iconHover} group-hover:text-white`}
              >
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{f.title}</h3>
              <p className="leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-extrabold text-slate-900 md:text-5xl">Qanday ishlaydi?</h2>
            <p className="mb-10 text-lg text-slate-600">
              To'rt oddiy qadam — va kelajak yo'nalishingiz aniq bo'ladi.
            </p>

            <div className="space-y-6">
              {[
                { title: "Ro'yxatdan o'ting", sub: "Profilingizni to'ldiring" },
                { title: "Testlarni yeching", sub: "15-30 daqiqa davom etadi" },
                { title: "Tavsiyalarni oling", sub: "Shaxsiy profilingiz shakllanadi" },
                { title: "Maslahatchi bilan muloqot", sub: "Natijalarni birgalikda muhokama qiling" },
              ].map((s) => (
                <div key={s.title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{s.title}</p>
                    <p className="text-slate-500">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/auth"
              className="mt-12 inline-flex rounded-xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
            >
              Hoziroq boshlash
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rotate-3 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10 blur-2xl" />
            <div className="relative space-y-4 rounded-[40px] border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
              {[
                { code: "H", label: "Holland RIASEC", sub: "Qiziqish profili", bg: "bg-indigo-50", color: "text-indigo-600" },
                { code: "R", label: "Raven IQ", sub: "Intellekt darajasi", bg: "bg-blue-50", color: "text-blue-600" },
              ].map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:scale-105"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.bg} text-xs font-bold italic ${t.color}`}>
                      {t.code}
                    </div>
                    <span className="font-bold text-slate-900">{t.label}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.sub}</span>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-2xl bg-white p-5 text-indigo-600 shadow-sm ring-2 ring-indigo-500/20 transition-transform hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold italic text-white">
                    B
                  </div>
                  <span className="font-bold text-slate-900">Big Five</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Shaxsiyat tipi</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-5 transition-transform hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <Star className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-white">TOP 5 kasb</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tavsiyalar</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 text-center text-sm text-slate-400 md:px-8">
        © {new Date().getFullYear()} EduLens — O'zbekiston o'quvchilari uchun
      </footer>
    </div>
  );
}
