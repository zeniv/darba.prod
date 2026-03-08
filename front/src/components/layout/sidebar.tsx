"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Image,
  Video,
  Music,
  Layers,
  CreditCard,
  Rss,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: SidebarItem[];
}

const menuItems: SidebarItem[] = [
  {
    label: "AI Чат",
    href: "/",
    icon: MessageSquare,
  },
  {
    label: "Генерация",
    href: "#",
    icon: Sparkles,
    children: [
      { label: "Изображения", href: "/tools/txt2img", icon: Image },
      { label: "Видео", href: "/tools/txt2video", icon: Video },
      { label: "Аудио", href: "/tools/txt2audio", icon: Music },
      { label: "Lipsync", href: "/tools/lipsync", icon: Layers },
    ],
  },
  {
    label: "Лента",
    href: "/feed",
    icon: Rss,
  },
  {
    label: "Тарифы",
    href: "/pricing",
    icon: CreditCard,
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "w-64 border-r border-border shrink-0 bg-background flex flex-col overflow-y-auto",
          "fixed inset-y-0 left-0 z-50 pt-14 transition-transform duration-200 md:relative md:pt-0 md:translate-x-0 md:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="p-3 space-y-0.5 flex-1">
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.href + item.label}
              item={item}
              pathname={pathname}
              onNavigate={onClose}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">
            Darba AI Studio v0.1
          </p>
        </div>
      </aside>
    </>
  );
}

function SidebarMenuItem({
  item,
  pathname,
  depth = 0,
  onNavigate,
}: {
  item: SidebarItem;
  pathname: string;
  depth?: number;
  onNavigate: () => void;
}) {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground",
            "cursor-default select-none",
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          <ChevronRight className="h-3 w-3" />
        </div>
        <div className="ml-2">
          {item.children.map((child) => (
            <SidebarMenuItem
              key={child.href + child.label}
              item={child}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
