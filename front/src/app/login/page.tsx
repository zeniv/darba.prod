"use client";

import { login, type SocialProvider } from "@/lib/auth";

const PROVIDERS: { key: SocialProvider; label: string; bg: string; text: string }[] = [
  { key: "google", label: "Google", bg: "bg-white border border-border hover:bg-gray-50", text: "text-gray-700" },
  { key: "vk", label: "VK", bg: "bg-[#0077FF] hover:bg-[#0066DD]", text: "text-white" },
  { key: "facebook", label: "Facebook", bg: "bg-[#1877F2] hover:bg-[#1565C0]", text: "text-white" },
  { key: "apple", label: "Apple", bg: "bg-black hover:bg-gray-900", text: "text-white" },
  { key: "instagram", label: "Instagram", bg: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90", text: "text-white" },
];

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Вход в Darba</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Выберите способ входа
          </p>
        </div>

        <div className="space-y-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              onClick={() => login(p.key)}
              className={`w-full flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${p.bg} ${p.text}`}
            >
              <ProviderIcon provider={p.key} />
              Войти через {p.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">или</span>
          </div>
        </div>

        <button
          onClick={() => login()}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
        >
          Войти по email
        </button>
      </div>
    </div>
  );
}

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  switch (provider) {
    case "google":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case "vk":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.188 1.368 1.259 2.184 1.814.616.42 1.084.327 1.084.327l2.178-.03s1.14-.07.6-.964c-.045-.073-.32-.661-1.644-1.868-1.386-1.264-1.2-1.06.469-3.248.876-1.15 1.226-1.852 1.116-2.152-.104-.288-.748-.212-.748-.212l-2.45.015s-.182-.025-.316.056c-.131.079-.215.263-.215.263s-.387 1.028-.903 1.903c-1.088 1.848-1.524 1.946-1.702 1.832-.414-.266-.31-1.066-.31-1.634 0-1.776.269-2.516-.525-2.708-.264-.064-.457-.106-1.13-.113-.862-.008-1.592.003-2.005.205-.275.135-.487.434-.358.451.16.02.522.098.714.358.247.336.239 1.09.239 1.09s.142 2.093-.332 2.352c-.325.177-.77-.185-1.724-1.838-.49-.847-.86-1.784-.86-1.784s-.071-.175-.198-.269c-.154-.113-.369-.149-.369-.149l-2.327.015s-.349.01-.477.162c-.114.134-.009.413-.009.413s1.816 4.244 3.874 6.384c1.886 1.963 4.028 1.834 4.028 1.834z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "apple":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
  }
}
