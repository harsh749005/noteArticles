"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";

// One tap sign-in with Google. No emails, no codes.
export default function SignInCard() {
  const [statusText, setStatusText] = useState("");

  async function signInWithGoogle() {
    setStatusText("Opening Google…");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setStatusText("Couldn’t start Google sign-in. Try again.");
  }

  return (
    <div className="signin">
      <h1>Note<span>Articles</span></h1>
      <p>Sign in once and stay signed in.</p>
      <button
        className="btn"
        style={{ marginTop: 18, padding: "14px 24px", fontSize: 16 }}
        onClick={signInWithGoogle}
      >
        Continue with Google
      </button>
      <p>{statusText}</p>
    </div>
  );
}