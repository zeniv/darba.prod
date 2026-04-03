import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <p className="text-7xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-bold mt-4">Страница не найдена</h1>
      <p className="text-muted-foreground text-sm mt-2 text-center max-w-md">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}
