"use client";
import { useState } from "react";
import { pickCoverGradient } from "@/lib/linkHelpers";

// One saved article: picture, title (editable), site, and when you read it.
export default function ArticleCard({ article, onRename, onRemove }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(article.title);

  function startEditingTitle() {
    setDraftTitle(article.title);
    setIsEditingTitle(true);
  }

  function finishEditingTitle(shouldSave) {
    const cleanTitle = draftTitle.trim();
    setIsEditingTitle(false);
    if (shouldSave && cleanTitle && cleanTitle !== article.title) onRename(article.id, cleanTitle);
  }

  // Real article picture when we found one, otherwise a colourful gradient.
  const coverStyle = article.imageUrl
    ? { background: `linear-gradient(180deg, #0000 35%, #000b), url(${JSON.stringify(article.imageUrl)}) center/cover` }
    : { background: pickCoverGradient(article.siteName) };

  const readAtText = new Date(article.readAt).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="card">
      <div className="cover" style={coverStyle}>
        {!article.imageUrl && <i>{(article.siteName || "?").charAt(0).toUpperCase()}</i>}
        <em>{article.siteName || "link"}</em>
      </div>

      <div className="body">
        {isEditingTitle ? (
          <input
            className="tedit"
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={() => finishEditingTitle(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") finishEditingTitle(true);
              if (event.key === "Escape") finishEditingTitle(false);
            }}
          />
        ) : (
          <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
        )}
        <div className="meta">Read {readAtText}</div>
      </div>

      <button className="del" onClick={() => onRemove(article.id)} title="Remove">✕</button>
      <button className="del ed" onClick={startEditingTitle} title="Edit title">✎</button>
    </div>
  );
}
