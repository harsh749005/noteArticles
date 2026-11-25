"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";

// No passwords: we email a sign-in link.
export default function SignInCard() {
  const [email, setEmail] = useState("");
  const [statusText, setStatusText] = useState("");

  async function sendSignInLink() {
    setStatusText("Sending…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setStatusText(
      error
        ? "Couldn’t send the link. Check the email and try again."
        : "Check your inbox. Your sign-in link is on its way."
    );
  }

  return (
    <div className="signin">
      <h1>Note<span>Articles</span></h1>
      <p>Sign in with your email. No password needed.</p>
      <div className="signin-box">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendSignInLink()}
        />
        <button className="btn" onClick={sendSignInLink}>Send link</button>
      </div>
      <p>{statusText}</p>
    </div>
  );
}
