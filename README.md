# خدمات قنا (Qena Services)

منصة ويب تربط أهل محافظة قنا بالفنيين ومقدمي الخدمات — الفني يسجّل بنفسه، والإدارة تراجع قبل الظهور.

## التقنيات
- React 18 + Vite (واجهة عربية RTL، PWA قابلة للتثبيت)
- Supabase (Postgres + Row Level Security)

## بنية البيانات
- `provider_applications` — طلبات تسجيل الفنيين (خاصة: إدخال فقط، بدون قراءة عامة)
- `providers` — الفنيون المعتمدون فقط (قراءة عامة، بدون بيانات تواصل)
- `requests` — طلبات الخدمة من العملاء (إدخال فقط)
- الاعتماد يتم من لوحة تحكم Supabase عبر الدالة `approve_provider(app_id)` (للمالك فقط)

## التشغيل محليًا
    npm install
    npm run dev

## النشر
مستضاف على Vercel: https://qena-services.vercel.app
