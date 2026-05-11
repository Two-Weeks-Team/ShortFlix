import { redirect } from "next/navigation";

// /app → /app/today (canonical entry into the daily-use surface)
export default function AppIndexPage() {
  redirect("/app/today");
}
