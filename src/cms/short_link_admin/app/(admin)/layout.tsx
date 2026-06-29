"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Separator, Link } from "@heroui/react";
import { LayoutDashboard, Link2, Users, LogOut } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth-context";

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-default-400">Loading…</p>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/links", label: "Links", icon: Link2 },
    { href: "/users", label: "Users", icon: Users },
  ];

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-60 shrink-0 flex-col border-r border-default-200 bg-default-50">
        <div className="flex h-14 items-center gap-2 px-4">
          <Link2 className="h-5 w-5 text-accent" />
          <span className="text-lg font-bold tracking-tight">ShortLink</span>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-default-600 hover:bg-default-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Separator />
        <div className="p-3">
          <div className="mb-2 truncate px-1 text-xs text-default-500">
            {user.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onPress={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
