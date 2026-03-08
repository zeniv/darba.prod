"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { User, Heart, MessageCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, fetchFollowCounts } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function UserProfilePage({ params }: Props) {
  const { slug } = use(params);
  const isNumericId = slug.startsWith("id");

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["user-profile", slug],
    queryFn: () =>
      apiFetch<{
        id: string;
        username: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        bio: string | null;
      }>(`/users/${slug}`),
  });

  // Fetch follow counts
  const { data: counts } = useQuery({
    queryKey: ["follow-counts", profile?.id],
    queryFn: () => fetchFollowCounts(profile!.id),
    enabled: !!profile?.id,
  });

  // Fetch user's public posts
  const { data: posts } = useQuery({
    queryKey: ["user-posts", profile?.id],
    queryFn: () =>
      apiFetch<any[]>(`/posts/feed?userId=${profile!.id}`),
    enabled: !!profile?.id,
  });

  const displayName = profile?.displayName || (isNumericId ? slug : `@${slug}`);
  const userPosts = posts || [];

  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {/* User header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="w-20 h-20 object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {profile?.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{counts?.followers ?? 0}</strong>{" "}
                  подписчиков
                </span>
                <span>
                  <strong className="text-foreground">{counts?.following ?? 0}</strong>{" "}
                  подписок
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Подписаться</Button>
              <Button variant="ghost" size="icon" title="Донат">
                <Gift className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mb-6">{profile.bio}</p>
          )}

          {/* User content grid */}
          <h2 className="text-lg font-semibold mb-4">Работы</h2>
          {userPosts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="aspect-square bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
                >
                  {post.mediaUrls?.[0] ? (
                    <img
                      src={post.mediaUrls[0]}
                      alt={post.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
                      {post.title || post.content?.slice(0, 60) || "Пост"}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" /> {post._count?.likes ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" /> {post._count?.comments ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
