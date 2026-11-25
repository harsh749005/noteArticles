// Everything about understanding a link lives here.

export function looksLikeALink(text) {
  return /^https?:\/\/\S+$/i.test((text || "").trim());
}

export function getSiteName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Used when a page doesn't tell us its title: "/my-great-post" becomes "My Great Post".
export function guessTitleFromLink(url) {
  try {
    const lastPart = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() || "");
    const words = lastPart
      .replace(/\.(html?|php|aspx?)$/i, "")
      .replace(/[-_+]+/g, " ")
      .replace(/\b[0-9a-f]{8,}\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (words.length < 4 || /^\d+$/.test(words)) return getSiteName(url);
    return words.replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return url;
  }
}

// Same site, same colours: the gradient is picked from the site's name.
export function pickCoverGradient(siteName) {
  let number = 0;
  for (const letter of siteName) number = (number * 31 + letter.charCodeAt(0)) >>> 0;
  const warmHues = [22, 34, 42, 300, 330, 14, 48, 280];
  const first = warmHues[number % warmHues.length];
  const second = warmHues[(number >> 3) % warmHues.length];
  return `linear-gradient(135deg, hsl(${first} 38% 26%), hsl(${second} 34% 14%))`;
}
