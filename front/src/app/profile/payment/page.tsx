"use client";

import { useAuth } from "@/components/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPaymentHistory,
  fetchTokenBalance,
  type Payment,
} from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: "Оплачен", color: "text-green-600" },
  pending: { label: "Ожидание", color: "text-yellow-600" },
  failed: { label: "Ошибка", color: "text-red-600" },
  refunded: { label: "Возврат", color: "text-muted-foreground" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string, currency: string) {
  const n = parseFloat(amount);
  return n.toLocaleString("ru-RU") + (currency === "RUB" ? " ₽" : ` ${currency}`);
}

export default function PaymentHistoryPage() {
  const { token } = useAuth();

  const { data: balanceData } = useQuery({
    queryKey: ["token-balance"],
    queryFn: () => fetchTokenBalance(token!),
    enabled: !!token,
  });

  const { data: payments } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => fetchPaymentHistory(token!),
    enabled: !!token,
  });

  const balance = balanceData?.balance ?? 0;
  const history: Payment[] = payments || [];

  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">История платежей</h1>
          <p className="text-muted-foreground mb-8">
            Ваши оплаты, чеки и баланс токенов
          </p>

          {/* Balance card */}
          <div className="p-6 border border-border rounded-xl mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Баланс токенов</p>
              <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
            </div>
            <Button>Пополнить</Button>
          </div>

          {/* Payment history table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="p-4 bg-muted/50 border-b border-border flex gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex-1">Дата</span>
              <span className="w-32">Тариф</span>
              <span className="w-24">Сумма</span>
              <span className="w-24">Статус</span>
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Нет платежей
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.map((p) => {
                  const st = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
                  return (
                    <div
                      key={p.id}
                      className="px-4 py-3 flex gap-4 text-sm items-center"
                    >
                      <span className="flex-1">{formatDate(p.createdAt)}</span>
                      <span className="w-32">{p.plan?.displayName || "—"}</span>
                      <span className="w-24">
                        {formatAmount(p.amount, p.currency)}
                      </span>
                      <span className={`w-24 ${st.color}`}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Support link */}
          <div className="mt-6 text-center">
            <a href="/profile/support">
              <Button variant="outline" size="sm">
                Создать тикет в поддержку
              </Button>
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
