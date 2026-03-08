import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, Wallet, HelpCircle, LogOut, Trash2 } from "lucide-react";

const profileMenuItems = [
  { label: "Профиль", href: "/profile", icon: User },
  { label: "Настройки", href: "/profile/settings", icon: Settings },
  { label: "Тариф", href: "/pricing", icon: CreditCard },
  { label: "Баланс", href: "/profile/payment", icon: Wallet },
  { label: "Помощь", href: "/profile/support", icon: HelpCircle },
];

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Профиль</h1>

          {/* Avatar + Info */}
          <div className="flex items-center gap-4 p-6 border border-border rounded-xl mb-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Гость</p>
              <p className="text-sm text-muted-foreground">
                Войдите, чтобы увидеть ваш профиль
              </p>
            </div>
            <Button variant="outline" size="sm">
              Войти
            </Button>
          </div>

          {/* Menu */}
          <nav className="space-y-1 mb-8">
            {profileMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-sm transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Danger zone */}
          <div className="border-t border-border pt-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Выход
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive">
              <Trash2 className="h-4 w-4" />
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
