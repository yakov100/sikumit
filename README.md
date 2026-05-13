# סיכומית

אפליקציית Next.js לכתיבה, שמירה, ארגון וחיפוש של פתקים וסיכומים בעברית.

## פלטפורמה

האפליקציה רצה כ-Next.js 16 מלא (App Router). פריסה מומלצת: Vercel.

## יכולות

- עורך עשיר בסיסי עם כותרות, הדגשה, רשימות וצ׳קבוקסים
- **שמירה אוטומטית של פתקים ב-Supabase בענן** (דורש התחברות)
- גיבוי מקומי ב-IndexedDB לתמיכה באופליין
- מיגרציה אוטומטית מנתונים מקומיים לענן בהתחברות ראשונה
- הרשמה והתחברות עם אימייל וסיסמה
- כל משתמש רואה רק את הפתקים שלו (Row Level Security)
- חיפוש בכותרת, תוכן, תגיות ונושאים
- ייבוא קובץ Word בפורמט `.docx` לפתק חדש
- זיהוי כותרות ורשימות בסיסיות בזמן ייבוא Word
- ייצוא הפתק הנוכחי לקובץ Word בפורמט `.docx`
- עבודה אופליין אחרי ביקור ראשון באתר, באמצעות Service Worker

## הגדרת Supabase

### 1. יצירת פרויקט Supabase

היכנסו ל-[supabase.com](https://supabase.com) וצרו פרויקט חדש.

### 2. יצירת הטבלה

הריצו את ה-SQL מהקובץ `supabase/migrations/20260513_create_workspaces_table.sql` ב-SQL Editor של Supabase, או השתמשו ב-Supabase CLI:

```bash
supabase db push
```

### 3. משתני סביבה

צרו קובץ `.env.local` בשורש הפרויקט עם הפרטים הבאים:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
```

ניתן למצוא את הערכים ב-Supabase Dashboard תחת **Project Settings → API**.

## הרצה

```bash
npm install
npm run dev
```

לאחר ההרצה פותחים את:

```text
http://localhost:3000
```

## בדיקות

```bash
npm run lint
npm run build
```

## CI ופריסה

כל push ל-`main` ו-PR מריצים את workflow [`ci.yml`](.github/workflows/ci.yml) שמבצע lint, typecheck, test ו-build.

לפריסה ל-Vercel: לחבר את הרפו דרך Vercel Dashboard ולהגדיר את משתני הסביבה (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
