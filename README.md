# סיכומית

אפליקציית Next.js לכתיבה, שמירה, ארגון וחיפוש של פתקים וסיכומים בעברית.

## האתר

לאחר הפעלת GitHub Pages בריפוזיטורי, האתר יהיה זמין בכתובת:

```text
https://yakov100.github.io/sikumit/
```

## יכולות

- כתיבה ושמירה אוטומטית של פתקים בדפדפן
- חיפוש בכותרת, תוכן, תגיות ונושאים
- ייבוא קובץ Word בפורמט `.docx` לפתק חדש
- ייצוא הפתק הנוכחי לקובץ Word בפורמט `.docx`
- עבודה אופליין אחרי ביקור ראשון באתר, באמצעות Service Worker

## הרצה

```bash
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

## GitHub Pages

כל push לענף `main` מריץ GitHub Actions שמבצע static export ומפרסם את תיקיית `out` ל-GitHub Pages.
