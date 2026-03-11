"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";

interface MenuItem {
  id: string;
  icon?: string;
  label?: { ru?: string; en?: string };
  url?: string;
  children?: MenuItem[];
}

export default function AdminMenuPage() {
  const { data: items } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: () => apiFetch<MenuItem[]>("/admin/menu"),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Управление меню</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить пункт
        </Button>
      </div>

      <div className="space-y-2">
        {(items || []).map((item: MenuItem) => (
          <div key={item.id}>
            <div className="border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="text-sm">{item.icon}</span>
              <span className="flex-1 text-sm font-medium">
                {item.label?.ru || item.label?.en || "—"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {item.url || "—"}
              </span>
              <Button variant="ghost" size="sm">
                Изменить
              </Button>
            </div>
            {/* Children */}
            {item.children?.map((child: MenuItem) => (
              <div
                key={child.id}
                className="ml-8 mt-1 border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="text-xs">{child.icon}</span>
                <span className="flex-1 text-sm">
                  {child.label?.ru || child.label?.en || "—"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {child.url || "—"}
                </span>
              </div>
            ))}
          </div>
        ))}
        {(!items || items.length === 0) && (
          <div className="text-center text-muted-foreground py-12">
            Меню пока пустое
          </div>
        )}
      </div>
    </div>
  );
}
