# EduLens — Deploy va sozlash qoʻllanmasi

Bu hujjat scoring tizimini (Edge Function + migratsiyalar) Supabase'ga
joylashtirish va loyihani ishga tushirish tartibini tushuntiradi.

---

## 📦 Nima qoʻshildi

| Fayl | Vazifasi |
|---|---|
| `supabase/functions/complete-session/index.ts` | Test tugagach ball hisoblaydi, natija va profilni yozadi |
| `supabase/functions/_shared/scoring.ts` | Holland, Ayzenk, Big5, IQ, umumiy ball hisoblash |
| `supabase/functions/_shared/profile.ts` | Kasb mosligi + yigʻma profil (radar, IQ) |
| `supabase/functions/_shared/cors.ts` | CORS sarlavhalari |
| `supabase/migrations/20260607120000_full_questions_seed.sql` | Holland 60, Ayzenk 57, Math IQ + kalitlar, Big5, EQ, Liderlik |
| `src/routes/test.$id.tsx` | `finishTest` endi Edge Function'ni chaqiradi |
| `src/routes/my-profile.tsx` | Real `student_profiles` maʼlumotini koʻrsatadi |

---

## 🟢 1-USUL: Lovable orqali (eng oson)

Agar loyiha Lovable bilan sinxron boʻlsa:

1. Bu oʻzgarishlarni GitHub'ga push qiling (Kiro buni qiladi).
2. Lovable GitHub'dan oʻzgarishlarni avtomatik oladi.
3. Lovable Cloud **migratsiyalarni** va **Edge Function'ni** avtomatik deploy qiladi.
4. Tayyor — testni yechib koʻring.

> Lovable'da "Sync" yoki "Pull from GitHub" tugmasini bosishingiz kerak boʻlishi mumkin.

---

## 🔵 2-USUL: Supabase CLI orqali (qoʻlda)

### Tayyorgarlik
```bash
# Supabase CLI oʻrnatish (agar yoʻq boʻlsa)
npm install -g supabase

# Loyihaga ulanish (project_id config.toml'da bor)
supabase login
supabase link --project-ref avfehwaamhzcydpbuitt
```

### Migratsiyani qoʻllash (savollar + kalitlar)
```bash
supabase db push
```

### Edge Function'ni deploy qilish
```bash
supabase functions deploy complete-session
```

> ✅ Scoring funksiyasi qoʻshimcha API kalit talab qilmaydi —
> u Supabase avtomatik beradigan `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
> `SUPABASE_SERVICE_ROLE_KEY` muhit oʻzgaruvchilaridan foydalanadi.

---

## 💻 Frontendni ishga tushirish

`.env` faylida quyidagilar boʻlishi kerak (Lovable avtomatik qoʻyadi):
```
VITE_SUPABASE_URL=https://avfehwaamhzcydpbuitt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon public key>
```

Ishga tushirish:
```bash
bun install      # yoki npm install
bun run dev      # yoki npm run dev
```

---

## 🧪 Tekshirish (test oqimi)

1. Roʻyxatdan oʻting (rol: Oʻquvchi).
2. **Holland (RIASEC)** testini yeching (60 savol) → "Tugatish".
3. Edge Function ishga tushadi → natija hisoblanadi.
4. **Mening profilim** sahifasiga oʻting:
 - Radar grafik (qobiliyatlar)
 - Holland kodi (masalan, "RIA")
 - Sizga mos TOP 5 kasb
5. **Matematik IQ** testini yeching → profilingizda IQ koʻrsatkichlari paydo boʻladi.

---

## ⚙️ Scoring qanday ishlaydi

```
Test tugaydi (finishTest)
   ↓
supabase.functions.invoke("complete-session", { sessionId })
   ↓
Edge Function (serverda, service_role bilan):
   • javoblarni oʻqiydi
   • test_type bo'yicha ball hisoblaydi (Holland/Ayzenk/IQ/...)
   • IQ testlar uchun question_answer_keys'ni o'qiydi (himoyalangan!)
   • test_results jadviga yozadi
   • barcha natijalardan student_profiles ni qayta quradi
   • Holland kodiga qarab top 5 kasbni tanlaydi
   ↓
Frontend (my-profile) → radar, IQ, kasblarni ko'rsatadi
```

**Xavfsizlik:** toʻgʻri javoblar (`question_answer_keys`) faqat serverda
oʻqiladi — oʻquvchi hech qachon koʻra olmaydi (aldab boʻlmaydi).

---

## 📋 Keyingi bosqichlar (hali qilinmagan)

- 🤖 AI tahlil (Claude/GPT) — `analyze-profile` Edge Function
- 📄 PDF hisobot
- 📈 Maslahatchi analytics sahifasi
- 🖼 Raven IQ uchun rasmli savollar
