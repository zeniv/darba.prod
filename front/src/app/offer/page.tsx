import { AppShell } from "@/components/layout/app-shell";

export default function OfferPage() {
  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1>Оферта</h1>
          <p className="text-muted-foreground">
            Содержимое этой страницы управляется из админки: /admin/menu/
          </p>
          {/* Контент загружается из API → CMS (Pages table в БД) */}
          <div className="mt-8 p-6 border border-dashed border-border rounded-xl text-center text-muted-foreground">
            Контент оферты будет загружен из базы данных
          </div>
        </div>
      </div>
    </AppShell>
  );
}
