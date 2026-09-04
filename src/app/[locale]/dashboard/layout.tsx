import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guards this route, but double-check on the server.
  let email: string | undefined;
  let isAdmin = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/dashboard");
    email = user.email ?? undefined;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  return (
    <CommandPalette isAdmin={isAdmin}>
      <div className="flex min-h-screen flex-col md:flex-row-reverse">
        <DashboardSidebar email={email} isAdmin={isAdmin} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-8">{children}</main>
      </div>
    </CommandPalette>
  );
}
