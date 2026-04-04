"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  Users,
  Headphones,
  FileText,
  Menu,
  Settings,
  Shield,
  CreditCard,
  Bot,
  BarChart3,
  MessageCircle,
  Megaphone,
  Loader2,
} from "lucide-react";

const ADMIN_ROLES = ["admin", "realm-admin", "manager"];

const adminNav = [
  { label: "Дашборд", href: "/admin", icon: LayoutDashboard },
  { label: "Пользователи", href: "/admin/users", icon: Users },
  { label: "Статистика", href: "/admin/users/stat", icon: BarChart3 },
  { label: "Поддержка", href: "/admin/support", icon: Headphones },
  { label: "Страницы", href: "/admin/pages", icon: FileText },
  { label: "Меню", href: "/admin/menu", icon: Menu },
  { label: "Дизайн", href: "/admin/settings/design", icon: Settings },
  { label: "Платежи", href: "/admin/settings/payments", icon: CreditCard },
  { label: "AI", href: "/admin/settings/ai", icon: Bot },
  { label: "Telegram", href: "/admin/settings/telegram", icon: MessageCircle },
  { label: "Маркетинг", href: "/admin/settings/marketing", icon: Megaphone },
  { label: "Безопасность", href: "/admin/security", icon: Shield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const hasAccess = user?.roles?.some((r) => ADMIN_ROLES.includes(r)) ?? false;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasAccess) {
      router.replace("/");
    }
  }, [loading, user, hasAccess, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-muted/30 p-4 hidden md:block">
        <div className="mb-6">
          <Link href="/" className="text-lg font-bold">
            Darba
          </Link>
          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <nav className="space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
