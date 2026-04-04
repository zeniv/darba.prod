"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CmsPage {
  id: string;
  slug: string;
  title?: { ru?: string; en?: string };
  isPublic: boolean;
}

export default function AdminPagesPage() {
  const { data: pages } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => authFetch<CmsPage[]>("/admin/pages"),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CMS Страницы</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Заголовок</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(pages || []).map((p: CmsPage) => (
              <tr key={p.id} className="hover:bg-accent/50">
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3">{p.title?.ru || p.title?.en || "—"}</td>
                <td className="px-4 py-3">
                  {p.isPublic ? (
                    <span className="text-green-600 text-xs">Опубликована</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Скрыта</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    Редактировать
                  </Button>
                </td>
              </tr>
            ))}
            {(!pages || pages.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Нет страниц
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
