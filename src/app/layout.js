import "./globals.css";

export const metadata = {
  title: "NoteArticles",
  description: "Every article you read, in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
