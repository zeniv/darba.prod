import { AppShell } from "@/components/layout/app-shell";

export default function DisclaimerPage() {
  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1>Дисклаймер</h1>
          <p className="text-muted-foreground">
            Содержимое этой страницы управляется из админки: /admin/menu/
          </p>
          <div className="mt-8 p-6 border border-dashed border-border rounded-xl text-center text-muted-foreground">
            Контент дисклаймера будет загружен из базы данных
          </div>
        </div>
      </div>
    </AppShell>
  );
}
