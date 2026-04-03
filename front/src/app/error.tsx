"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <p className="text-7xl font-bold text-muted-foreground/30">500</p>
      <h1 className="text-2xl font-bold mt-4">Что-то пошло не так</h1>
      <p className="text-muted-foreground text-sm mt-2 text-center max-w-md">
        Произошла внутренняя ошибка. Попробуйте обновить страницу.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
}
