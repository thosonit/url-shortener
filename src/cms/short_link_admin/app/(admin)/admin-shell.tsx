"use client";

import { usePathname } from "next/navigation";
import { Button, Separator, Link } from "@heroui/react";
import { LayoutDashboard, Link2, Users, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/users", label: "Users", icon: Users },
];

interface AdminShellProps {
  email: string;
  role: string;
  children: React.ReactNode;
}

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-60 shrink-0 flex-col border-r border-default-200 bg-default-50">
        <div className="flex h-14 items-center gap-2 px-4">
          <Link2 className="h-5 w-5 text-accent" />
          <span className="text-lg font-bold tracking-tight">ShortLink</span>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => {
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
            {email}
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
