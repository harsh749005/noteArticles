import ArticleCard from "@/components/ArticleCard";
import { dayKey } from "@/lib/readingStats";

// Lays the cards out in a grid, with a heading each time the day changes.
export default function ArticleGrid({ articles, emptyMessage, onRename, onRemove }) {
  if (articles.length === 0) {
    return <div className="grid"><div className="empty">{emptyMessage}</div></div>;
  }

  const gridItems = [];
  let dayOfPreviousArticle = "";

  articles.forEach((article) => {
    const dayOfThisArticle = dayKey(article.readAt);
    if (dayOfThisArticle !== dayOfPreviousArticle) {
      dayOfPreviousArticle = dayOfThisArticle;
      const heading = new Date(article.readAt).toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric",
      });
      gridItems.push(<div className="day" key={`day-${dayOfThisArticle}`}>{heading}</div>);
    }
    gridItems.push(<ArticleCard key={article.id} article={article} onRename={onRename} onRemove={onRemove} />);
  });

  return <div className="grid">{gridItems}</div>;
}
