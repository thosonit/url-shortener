import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AdminShell email={session.email} role={session.role}>
      {children}
    </AdminShell>
  );
}
