"use client";
import { useEffect, useState } from "react";

// true on phone-sized screens, so the app can switch to its mobile layout.
export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const phoneQuery = window.matchMedia("(max-width: 700px)");
    const updateAnswer = () => setIsPhone(phoneQuery.matches);
    updateAnswer();
    phoneQuery.addEventListener("change", updateAnswer);
    return () => phoneQuery.removeEventListener("change", updateAnswer);
  }, []);
  return isPhone;
}
