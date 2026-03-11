"use client";

import Link from "next/link";
import { Bell, Globe, LogIn, LogOut, Moon, Sun, Menu, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationCount] = useState(0);

  return (
    <header className="border-b border-border h-14 flex items-center px-4 md:px-6 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mr-2"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-auto">
        <span className="font-bold text-lg tracking-tight">Darba</span>
        <span className="text-muted-foreground text-sm hidden sm:inline">AI Studio</span>
      </Link>

      {/* Right side icons */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Language */}
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
        </Button>

        {/* Auth */}
        {user ? (
          <>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2 ml-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 ml-1">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Войти</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
