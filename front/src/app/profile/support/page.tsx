"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ChevronRight, Loader2 } from "lucide-react";
import {
  fetchTickets,
  fetchTicket,
  createTicket,
  addTicketMessage,
  type SupportTicket,
} from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Открыт", color: "bg-green-500" },
  in_progress: { label: "В работе", color: "bg-yellow-500" },
  closed: { label: "Закрыт", color: "bg-muted-foreground" },
};

export default function SupportPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const {
    data: tickets = [],
    isLoading,
  } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => fetchTickets(token!),
    enabled: !!token,
  });

  const expandedTicketQuery = useQuery({
    queryKey: ["support-ticket", expandedId],
    queryFn: () => fetchTicket(token!, expandedId!),
    enabled: !!token && !!expandedId,
  });

  const createMutation = useMutation({
    mutationFn: () => createTicket(token!, subject, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setShowForm(false);
      setSubject("");
      setMessage("");
    },
  });

  const replyMutation = useMutation({
    mutationFn: () => addTicketMessage(token!, expandedId!, replyContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", expandedId] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setReplyContent("");
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    createMutation.mutate();
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    replyMutation.mutate();
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
    setReplyContent("");
  }

  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Поддержка</h1>
              <p className="text-muted-foreground text-sm">
                Обращения в службу поддержки
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Новый тикет
            </Button>
          </div>

          {/* New ticket form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="border border-border rounded-xl p-6 mb-6 space-y-4"
            >
              <input
                type="text"
                placeholder="Тема обращения"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Опишите вашу проблему..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Отправить
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="border border-dashed border-border rounded-xl p-12 text-center">
              <Loader2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground text-sm">Загрузка...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                У вас пока нет обращений
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket: SupportTicket) => {
                const st = STATUS_LABELS[ticket.status] || STATUS_LABELS.open;
                const isExpanded = expandedId === ticket.id;
                const detail = expandedTicketQuery.data;

                return (
                  <div key={ticket.id}>
                    <div
                      onClick={() => toggleExpand(ticket.id)}
                      className="border border-border rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${st.color} shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {st.label}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    {/* Expanded ticket detail */}
                    {isExpanded && (
                      <div className="border border-border border-t-0 rounded-b-lg p-4 space-y-4">
                        {expandedTicketQuery.isLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : detail?.messages && detail.messages.length > 0 ? (
                          <div className="space-y-3">
                            {detail.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className="rounded-lg bg-accent/30 p-3"
                              >
                                <p className="text-sm whitespace-pre-wrap">
                                  {msg.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(msg.createdAt).toLocaleString("ru-RU")}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Сообщений пока нет
                          </p>
                        )}

                        {/* Reply form */}
                        {ticket.status !== "closed" && (
                          <form onSubmit={handleReply} className="space-y-2">
                            <textarea
                              placeholder="Написать ответ..."
                              rows={3}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button
                              type="submit"
                              size="sm"
                              disabled={replyMutation.isPending}
                            >
                              {replyMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Ответить
                            </Button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
