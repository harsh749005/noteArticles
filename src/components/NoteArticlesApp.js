"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";
import { loadMyArticles, saveArticleLink, renameArticle, removeArticle } from "@/lib/articleStore";
import { looksLikeALink } from "@/lib/linkHelpers";
import { useIsPhone } from "@/lib/useIsPhone";
import SignInCard from "@/components/SignInCard";
import PasteBar from "@/components/PasteBar";
import StatsRow from "@/components/StatsRow";
import ReadingGraph from "@/components/ReadingGraph";
import ArticleGrid from "@/components/ArticleGrid";

const HOW_MANY_RECENT_ON_PHONE_HOME = 6;
const DUPLICATE_LINK_ERROR = "23505"; // Postgres code for "already exists"

// The whole app. It owns the data; the smaller components only show it.
export default function NoteArticlesApp() {
  const [person, setPerson] = useState(null);
  const [isCheckingSignIn, setIsCheckingSignIn] = useState(true);
  const [articles, setArticles] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const isPhone = useIsPhone();

  // 1. Find out who is signed in, and keep listening for sign-ins and sign-outs.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setPerson(data.session?.user ?? null);
      setIsCheckingSignIn(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setPerson(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // 2. Once we know who it is, load their articles.
  useEffect(() => {
    if (person) loadTheArticles();
    else setArticles([]);
  }, [person]);

  // 3. Pasting a link anywhere on the page (outside a text box) saves it.
  useEffect(() => {
    function whenSomethingIsPasted(event) {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      saveALink(event.clipboardData.getData("text"));
    }
    document.addEventListener("paste", whenSomethingIsPasted);
    return () => document.removeEventListener("paste", whenSomethingIsPasted);
  });

  // 4. The CSS hides the home screen on phones while the search screen is open.
  useEffect(() => {
    document.body.classList.toggle("searching", isSearching);
  }, [isSearching]);

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  }

  async function loadTheArticles() {
    try {
      setArticles(await loadMyArticles());
    } catch {
      showMessage("Couldn’t load your articles");
    }
  }

  async function saveALink(text) {
    if (!looksLikeALink(text)) {
      showMessage("That doesn’t look like a link");
      return false;
    }
    try {
      const savedArticle = await saveArticleLink(text.trim());
      setArticles((current) => [savedArticle, ...current]);
      showMessage("Saved ✓");
      return true;
    } catch (error) {
      showMessage(error.code === DUPLICATE_LINK_ERROR ? "Already saved" : "Couldn’t save. Try again.");
      return false;
    }
  }

  async function changeATitle(articleId, newTitle) {
    try {
      await renameArticle(articleId, newTitle);
      setArticles((current) => current.map((a) => (a.id === articleId ? { ...a, title: newTitle } : a)));
      showMessage("Title updated");
    } catch {
      showMessage("Couldn’t rename");
    }
  }

  async function deleteAnArticle(articleId) {
    try {
      await removeArticle(articleId);
      setArticles((current) => current.filter((a) => a.id !== articleId));
    } catch {
      showMessage("Couldn’t remove it");
    }
  }

  function closeSearch() {
    setIsSearching(false);
    setSearchText("");
  }

  if (isCheckingSignIn) return <div className="wrap"><p className="hint">Loading…</p></div>;
  if (!person) return <SignInCard />;

  // Search looks at both the title and the site name, so edited titles are found too.
  const wanted = searchText.trim().toLowerCase();
  const matchingArticles = articles.filter(
    (article) => !wanted || `${article.title} ${article.siteName}`.toLowerCase().includes(wanted)
  );
  const isOnPhoneHomeScreen = isPhone && !isSearching;
  const articlesToShow = isOnPhoneHomeScreen
    ? matchingArticles.slice(0, HOW_MANY_RECENT_ON_PHONE_HOME)
    : matchingArticles;

  return (
    <div className="wrap">
      <header>
        <h1>Note<span>Articles</span></h1>
        <button className="signout" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>

      <PasteBar onSaveLink={saveALink} onOpenSearch={() => setIsSearching(true)} />
      <p className="hint">Tip: press Ctrl/⌘+V anywhere on this page and the link saves instantly.</p>

      <StatsRow articles={articles} />
      <ReadingGraph articles={articles} />

      <div className="bar-row">
        <button className="back" onClick={closeSearch} aria-label="Back">←</button>
        <input
          className="search"
          placeholder="Search articles by title or site…"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <ArticleGrid
        articles={articlesToShow}
        emptyMessage={articles.length ? "No articles match your search." : "Nothing here yet. Paste your first article link above."}
        onRename={changeATitle}
        onRemove={deleteAnArticle}
      />

      <div id="toast" className={message ? "show" : ""}>{message}</div>
    </div>
  );
}
