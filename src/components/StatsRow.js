import { countCurrentStreak, countBestStreak, countReadsInLastDays } from "@/lib/readingStats";

export default function StatsRow({ articles }) {
  return (
    <div className="stats">
      <div className="stat"><b>{articles.length}</b><small>Articles read</small></div>
      <div className="stat hot"><b>{countCurrentStreak(articles)}</b><small>Day streak</small></div>
      <div className="stat"><b>{countBestStreak(articles)}</b><small>Best streak</small></div>
      <div className="stat"><b>{countReadsInLastDays(articles, 7)}</b><small>Last 7 days</small></div>
    </div>
  );
}
