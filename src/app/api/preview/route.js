import { NextResponse } from "next/server";

// Never let the server be tricked into opening addresses inside its own network.
const PRIVATE_ADDRESSES = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1)/i;

function cleanUpHtmlText(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Finds <meta property="og:title" content="..."> whichever order the attributes are in.
function findMetaTag(html, names) {
  for (const name of names) {
    const nameFirst = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
    const contentFirst = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`, "i");
    const match = html.match(nameFirst) || html.match(contentFirst);
    if (match && match[1].trim()) return cleanUpHtmlText(match[1].trim());
  }
  return null;
}

function findPageTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? cleanUpHtmlText(match[1].trim()) : null;
}

export async function GET(request) {
  const link = new URL(request.url).searchParams.get("url");

  let address;
  try {
    address = new URL(link);
  } catch {
    return NextResponse.json({ error: "That is not a valid link" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(address.protocol) || PRIVATE_ADDRESSES.test(address.hostname)) {
    return NextResponse.json({ error: "That link can't be previewed" }, { status: 400 });
  }

  try {
    const reply = await fetch(address, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NoteArticlesBot/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });
    const html = (await reply.text()).slice(0, 300000);

    const title = findMetaTag(html, ["og:title", "twitter:title"]) || findPageTitle(html);
    const picture = findMetaTag(html, ["og:image", "twitter:image"]);
    const imageUrl = picture ? new URL(picture, address).href : null;

    return NextResponse.json({ title, imageUrl });
  } catch {
    // Some sites block bots. That's fine: the app falls back to a guessed title.
    return NextResponse.json({});
  }
}
