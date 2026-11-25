# NoteArticles (Next.js + Supabase)

## Where things live
- `src/lib/articleStore.js`: all database calls (load, save, rename, remove)
- `src/lib/readingStats.js`: streaks, totals and the graph numbers
- `src/lib/linkHelpers.js`: checking links, guessing titles, cover colours
- `src/app/api/preview/route.js`: server code that finds a link's real title and picture
- `src/components/NoteArticlesApp.js`: the main screen; the other components just display things

## Setup
1. Create a Supabase project, then run `supabase/schema.sql` in its SQL Editor.
2. Supabase -> Authentication -> URL Configuration: add your site URL (e.g. `http://localhost:3000` and your Vercel URL).
3. Copy `.env.example` to `.env.local` and fill in the two values from Project Settings -> API.
4. `npm install` then `npm run dev`.
5. On Vercel, add the same two environment variables before deploying.
