import { useContext } from "react";
import { FeedContext } from "../context/FeedContext";

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within <FeedProvider>");
  return ctx;
}
