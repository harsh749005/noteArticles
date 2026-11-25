// Talking to the database. Components never call Supabase directly:
// they use these four plain-English functions instead.
import { supabase } from "@/lib/supabaseBrowser";
import { getSiteName, guessTitleFromLink } from "@/lib/linkHelpers";

// The database uses snake_case; the app uses camelCase.
function turnRowIntoArticle(row) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    siteName: row.site_name,
    imageUrl: row.image_url,
    readAt: row.read_at,
  };
}

// Asks our own server (api/preview) to open the page and find its real title and picture.
async function askServerForPreview(url) {
  try {
    const reply = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
    return reply.ok ? await reply.json() : {};
  } catch {
    return {};
  }
}

export async function loadMyArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("read_at", { ascending: false });
  if (error) throw error;
  return data.map(turnRowIntoArticle);
}

export async function saveArticleLink(url) {
  const preview = await askServerForPreview(url);
  const { data, error } = await supabase
    .from("articles")
    .insert({
      url,
      title: preview.title || guessTitleFromLink(url),
      site_name: getSiteName(url),
      image_url: preview.imageUrl || null,
    })
    .select()
    .single();
  if (error) throw error;
  return turnRowIntoArticle(data);
}

export async function renameArticle(articleId, newTitle) {
  const { error } = await supabase.from("articles").update({ title: newTitle }).eq("id", articleId);
  if (error) throw error;
}

export async function removeArticle(articleId) {
  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) throw error;
}
