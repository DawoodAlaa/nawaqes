# النواقص - دريم فون

تطبيق ويب (PWA) لتسجيل نواقص المحل. بيتنزل على الشاشة الرئيسية للآيفون، ويشتغل من غير نت، وكل الموبايلات بتشوف نفس القائمة لحظيًا.

التقنيات: React + Vite + TypeScript + Tailwind + Supabase + vite-plugin-pwa.

---

## 1. التشغيل على جهازك

محتاج Node.js نسخة 18 أو أحدث.

```bash
npm install
```

انسخ ملف المفاتيح:

```bash
cp .env.example .env
```

وافتح `.env` وحط فيه مفاتيح Supabase (هتلاقيها في الخطوة 2):

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

شغّل:

```bash
npm run dev
```

وافتح الرابط اللي هيظهر (غالبًا http://localhost:5173).

> لو مفيش مفاتيح Supabase، التطبيق بيشتغل عادي بس البيانات بتتحفظ على الجهاز بس، والمؤشر هيفضل يقول إن فيه تغييرات مستنية.

لتجربة نسخة الإنتاج (وفيها الـ service worker والأوفلاين):

```bash
npm run build
npm run preview
```

---

## 2. عمل الجدول في Supabase

1. ادخل [supabase.com](https://supabase.com) واعمل مشروع جديد.
2. من القائمة الجانبية افتح **SQL Editor** ← **New query**.
3. انسخ محتوى الملف `supabase/schema.sql` كله والصقه، ودوس **Run**.
   الملف ده بيعمل:
   - جدول `shortages` بكل الأعمدة والقيم المسموحة.
   - trigger بيسجل `received_at` لوحده لما الحالة تبقى "تم الاستلام".
   - سياسات RLS **مؤقتة** بتسمح بالقراءة والكتابة بالـ anon key (لحد ما نضيف تسجيل دخول).
   - تفعيل Realtime على الجدول.
4. من **Project Settings** ← **API** (أو **Data API**) خد:
   - **Project URL** ← ده `VITE_SUPABASE_URL`
   - **anon public key** ← ده `VITE_SUPABASE_ANON_KEY`

للتأكد إن الـ Realtime شغال: افتح **Database** ← **Publications** ← `supabase_realtime`، لازم تلاقي `shortages` متعلم عليه.

---

## 3. النشر على Vercel

1. ارفع المشروع على GitHub.
2. ادخل [vercel.com](https://vercel.com) ← **Add New** ← **Project**، واختار الريبو.
3. Vercel هيعرف لوحده إنه مشروع Vite (Build Command: `npm run build`، Output: `dist`).
4. قبل ما تدوس Deploy افتح **Environment Variables** وضيف:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. دوس **Deploy**. هتاخد رابط زي `https://nawaqes.vercel.app`.

> لو غيرت المفاتيح بعد كده لازم تعمل **Redeploy**، لأن المفاتيح بتدخل في الكود وقت البناء.

أو من التيرمنال:

```bash
npx vercel
```

---

## 4. التنزيل على الآيفون

1. افتح رابط Vercel في **Safari** (لازم Safari، مش Chrome).
2. دوس زرار **المشاركة** (المربع اللي طالع منه سهم) تحت.
3. انزل واختار **إضافة إلى الشاشة الرئيسية** (Add to Home Screen).
4. الاسم هيبقى "النواقص"، دوس **إضافة**.

التطبيق هيفتح بملء الشاشة زي أي تطبيق عادي. افتحه مرة وأنت على النت عشان يتحفظ، وبعد كده يشتغل أوفلاين.

---

## إزاي الأوفلاين شغال

- أي إضافة أو تعديل بيتحفظ الأول في IndexedDB على الموبايل ويظهر فورًا.
- التغيير بيتحط في "طابور" وبيتبعت لـ Supabase أول ما النت يرجع (أو لما تفتح التطبيق تاني).
- لو فيه تغييرات لسه متبعتتش هيظهر مؤشر أصفر صغير فوق على اليمين فيه عددها.
- لو نفس الصنف اتعدل من موبايلين وهما أوفلاين، آخر واحد يتزامن هو اللي بيتحفظ.

## ملاحظات

- الأصناف اللي "تم الاستلام" مبتتمسحش، بتختفي من القائمة بس وتفضل في الجدول كسجل (ومنها بتيجي اقتراحات الأسماء).
- زرار المسح الأحمر في شاشة التعديل هو بس اللي بيمسح فعليًا، وبيطلب تأكيد.
- الأيقونات في `public/` (`pwa-192.png`، `pwa-512.png`، `apple-touch-icon.png`، `favicon.svg`). لو عايز تغيرها حط صور بنفس الأسامي والمقاسات.

## هيكل المشروع

```
src/
  App.tsx                 شاشة القائمة
  components/ItemSheet.tsx شاشة الإضافة والتعديل
  lib/store.ts            IndexedDB + المزامنة + Realtime
  lib/share.ts            نص المشاركة
  lib/utils.ts            الترتيب والوقت النسبي والبحث
supabase/schema.sql       الجدول والسياسات والـ Realtime
```
