"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicFeed, type Post } from "@/lib/api";
import { Heart, MessageCircle, User } from "lucide-react";

function PostCard({ post }: { post: Post }) {
  const hasMedia = post.mediaUrls.length > 0;
  const author = post.user;

  return (
    <div className="break-inside-avoid mb-4 border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Media */}
      {hasMedia && (
        <div className="bg-muted aspect-square flex items-center justify-center text-muted-foreground text-xs">
          {post.mediaType === "image" ? (
            <img
              src={post.mediaUrls[0]}
              alt={post.title || ""}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{post.mediaType || "media"}</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {post.title && (
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{post.title}</h3>
        )}
        {post.content && (
          <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>
        )}

        {/* Author + Stats */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {author.displayName || author.username || "Аноним"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post._count.comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { data: posts } = useQuery({
    queryKey: ["public-feed"],
    queryFn: () => fetchPublicFeed(),
    staleTime: 30_000,
  });

  const feed: Post[] = posts || [];

  return (
    <AppShell>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Лента</h1>
        <p className="text-muted-foreground mb-8">
          Работы пользователей, опубликованные в открытый доступ
        </p>

        {feed.length === 0 ? (
          /* Skeleton placeholders */
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const heights = [200, 280, 240, 320, 180, 260];
              const h = heights[i % heights.length];
              return (
                <div
                  key={i}
                  className="bg-muted rounded-xl animate-pulse break-inside-avoid"
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {feed.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
