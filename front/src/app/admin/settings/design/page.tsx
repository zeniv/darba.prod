"use client";

export default function AdminDesignPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Кастомизация дизайна</h1>
      <div className="space-y-6">
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Брендинг</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Название</label>
              <input
                type="text"
                defaultValue="Darba"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Основной цвет</label>
              <input
                type="color"
                defaultValue="#6366f1"
                className="w-12 h-10 border border-border rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          <p>Логотип, шрифты, CSS-переменные, тёмная тема</p>
          <p className="text-sm mt-2">Будет расширено</p>
        </div>
      </div>
    </div>
  );
}
