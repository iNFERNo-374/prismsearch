import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const hasResume = (resumes?.length ?? 0) > 0;
  const username = user.user_metadata?.username ?? "there";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar hasResume={hasResume} username={username} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
