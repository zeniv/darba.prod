"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlans, type Plan } from "@/lib/api";

const FEATURE_LABELS: Record<string, string> = {
  chat: "AI Чат",
  txt2img: "Генерация изображений",
  txt2audio: "Генерация аудио",
  txt2video: "Генерация видео",
  lipsync: "Lip-sync",
  maxResolution: "Макс. разрешение",
};

function planFeatures(plan: Plan): string[] {
  const result: string[] = [];
  for (const [key, value] of Object.entries(plan.features)) {
    if (value === true) {
      result.push(FEATURE_LABELS[key] || key);
    } else if (typeof value === "string") {
      result.push(`${FEATURE_LABELS[key] || key}: ${value}`);
    }
  }
  if (plan.tokens > 0) {
    result.push(`${plan.tokens.toLocaleString()} токенов / мес`);
  }
  return result;
}

function formatPrice(price: string, currency: string): string {
  const n = parseFloat(price);
  if (n === 0) return "0";
  return n.toLocaleString("ru-RU") + (currency === "RUB" ? " ₽" : ` ${currency}`);
}

export default function PricingPage() {
  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    staleTime: 60_000,
  });

  const displayPlans = plans || [];

  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Тарифы</h1>
          <p className="text-center text-muted-foreground mb-10">
            Выберите подходящий план
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {displayPlans.map((plan, i) => {
              const highlighted = i === 1;
              const features = planFeatures(plan);
              const isFree = parseFloat(plan.price) === 0;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-2xl border p-6 flex flex-col",
                    highlighted
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                      : "border-border",
                  )}
                >
                  <h2 className="text-xl font-bold">{plan.displayName}</h2>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    {!isFree && (
                      <span className="text-muted-foreground ml-1">
                        / {plan.period === "year" ? "год" : "мес"}
                      </span>
                    )}
                    {isFree && (
                      <span className="text-muted-foreground ml-2">навсегда</span>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={highlighted ? "default" : "outline"}
                  >
                    {isFree ? "Начать бесплатно" : `Выбрать ${plan.displayName}`}
                  </Button>

                  <div className="flex gap-3 justify-center mt-3 text-xs text-muted-foreground">
                    <a href="/offer" target="_blank" className="hover:underline">
                      Оферта
                    </a>
                    <a href="/disclaimer" target="_blank" className="hover:underline">
                      Дисклаймер
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
