// Everything about counting: streaks, totals, and the numbers behind the graph.

const ONE_DAY = 24 * 60 * 60 * 1000;

// "2026-11-25": one text label per calendar day, in the reader's own time zone.
export function dayKey(dateLike) {
  const day = new Date(dateLike);
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

function listDaysWithReading(articles) {
  return new Set(articles.map((article) => dayKey(article.readAt)));
}

// Days in a row, counting back from today. If nothing is read yet today,
// the streak is still alive as long as yesterday had a read.
export function countCurrentStreak(articles) {
  const daysWithReading = listDaysWithReading(articles);
  const day = new Date();
  if (!daysWithReading.has(dayKey(day))) day.setDate(day.getDate() - 1);

  let streak = 0;
  while (daysWithReading.has(dayKey(day))) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function countBestStreak(articles) {
  const oldestFirst = [...listDaysWithReading(articles)].sort();
  let best = 0;
  let currentRun = 0;
  let previousDay = null;

  for (const label of oldestFirst) {
    const day = new Date(`${label}T00:00:00`);
    const followsPreviousDay = previousDay && Math.round((day - previousDay) / ONE_DAY) === 1;
    currentRun = followsPreviousDay ? currentRun + 1 : 1;
    best = Math.max(best, currentRun);
    previousDay = day;
  }
  return best;
}

export function countReadsInLastDays(articles, howManyDays) {
  const cutoff = Date.now() - howManyDays * ONE_DAY;
  return articles.filter((article) => new Date(article.readAt).getTime() >= cutoff).length;
}

// One entry per day for the graph, oldest first: [{ date, count }, ...]
export function buildDailyCounts(articles, howManyDays) {
  const readsPerDay = {};
  articles.forEach((article) => {
    const label = dayKey(article.readAt);
    readsPerDay[label] = (readsPerDay[label] || 0) + 1;
  });

  const days = [];
  for (let daysAgo = howManyDays - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    days.push({ date, count: readsPerDay[dayKey(date)] || 0 });
  }
  return days;
}
