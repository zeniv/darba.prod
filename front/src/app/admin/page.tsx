"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Users, CreditCard, FileText, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  newUsersWeek: number;
  totalPosts: number;
  totalPayments: number;
  totalRevenue: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  // TODO: pass real admin token
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch<Stats>("/admin/stats"),
    staleTime: 30_000,
  });

  const s = stats || {
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    newUsersWeek: 0,
    totalPosts: 0,
    totalPayments: 0,
    totalRevenue: 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Пользователи" value={s.totalUsers} icon={Users} />
        <StatCard label="Новые (7д)" value={s.newUsersWeek} icon={TrendingUp} />
        <StatCard label="Платных" value={s.paidUsers} icon={CreditCard} />
        <StatCard label="Публикации" value={s.totalPosts} icon={FileText} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Активных" value={s.activeUsers} icon={Users} />
        <StatCard label="Оплат" value={s.totalPayments} icon={CreditCard} />
        <StatCard
          label="Выручка"
          value={`${Number(s.totalRevenue).toLocaleString("ru-RU")} ₽`}
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}
