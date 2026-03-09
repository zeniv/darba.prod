"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleCallback } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setError("No authorization code");
      return;
    }
    handleCallback(code).then((ok) => {
      if (ok) {
        router.replace("/");
      } else {
        setError("Authentication failed");
      }
    });
  }, [params, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Авторизация...</p>
    </div>
  );
}
