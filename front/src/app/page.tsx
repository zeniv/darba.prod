"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { runAiTask, fetchTaskStatus } from "@/lib/api";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function HomePage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearPoll;
  }, [clearPoll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        {
          role: "assistant",
          content:
            "Для использования AI-чата необходимо войти в аккаунт.",
        },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { taskId } = await runAiTask(token, "chat", {
        messages: allMessages,
      });

      let polls = 0;

      await new Promise<void>((resolve, reject) => {
        pollRef.current = setInterval(async () => {
          polls += 1;

          if (polls > MAX_POLLS) {
            clearPoll();
            reject(new Error("timeout"));
            return;
          }

          try {
            const task = await fetchTaskStatus(token, taskId);

            if (task.status === "done") {
              clearPoll();
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: task.result ?? "",
                },
              ]);
              resolve();
            } else if (task.status === "error") {
              clearPoll();
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: task.error ?? "Произошла ошибка при обработке запроса.",
                },
              ]);
              resolve();
            }
          } catch (err) {
            clearPoll();
            reject(err);
          }
        }, POLL_INTERVAL_MS);
      });
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "timeout"
          ? "Превышено время ожидания ответа. Попробуйте позже."
          : "Произошла ошибка. Попробуйте позже.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: msg },
      ]);
    } finally {
      clearPoll();
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col flex-1">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Darba AI Studio</h1>
                <p className="text-muted-foreground text-sm text-center max-w-md">
                  Все AI-инструменты в одном месте. Начните диалог или
                  используйте боковое меню для генерации изображений, аудио и
                  видео.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="max-w-2xl mx-auto flex items-end gap-2">
            <div className="flex-1 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Спросите что-нибудь..."
                rows={1}
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground resize-none"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
