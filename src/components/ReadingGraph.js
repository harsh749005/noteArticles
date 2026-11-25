"use client";
import { useState } from "react";
import { buildDailyCounts } from "@/lib/readingStats";

const DAY_CHOICES = [7, 30, 90];
const GRAPH_WIDTH = 640;
const GRAPH_HEIGHT = 150;
const SPACE_FOR_LABELS = 22;

export default function ReadingGraph({ articles }) {
  const [daysShown, setDaysShown] = useState(30);
  const days = buildDailyCounts(articles, daysShown);

  const tallestDay = Math.max(3, ...days.map((day) => day.count));
  const slotWidth = GRAPH_WIDTH / days.length;
  const gap = Math.min(4, slotWidth * 0.25);
  const firstDayLabel = days[0].date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="panel">
      <div className="ph">
        <span>Reading activity</span>
        <div className="seg">
          {DAY_CHOICES.map((choice) => (
            <button key={choice} className={choice === daysShown ? "on" : ""} onClick={() => setDaysShown(choice)}>
              {choice}d
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} role="img" aria-label="Articles read per day">
        {days.map((day, position) => {
          const barHeight = day.count
            ? Math.max(6, (day.count / tallestDay) * (GRAPH_HEIGHT - SPACE_FOR_LABELS - 8))
            : 3;
          const dayLabel = day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          return (
            <rect
              key={position}
              className={day.count ? "bar has" : "bar"}
              x={position * slotWidth + gap / 2}
              y={GRAPH_HEIGHT - SPACE_FOR_LABELS - barHeight}
              width={slotWidth - gap}
              height={barHeight}
              rx={Math.min(4, (slotWidth - gap) / 2)}
            >
              <title>{`${dayLabel}: ${day.count}`}</title>
            </rect>
          );
        })}
        <text className="axis" x="0" y={GRAPH_HEIGHT - 4}>{firstDayLabel}</text>
        <text className="axis" x={GRAPH_WIDTH} y={GRAPH_HEIGHT - 4} textAnchor="end">Today</text>
      </svg>
    </div>
  );
}
