"use client";

import { MessageCircleReply, Trash2 } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { formatFeedDate } from "@/lib/utils";
import type { CommentNode } from "@/types";

type CommentThreadProps = {
  comments: CommentNode[];
  currentUserId?: string | null;
  onReply?: (comment: CommentNode) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
  parentName?: string | null;
};

export function CommentThread({
  comments,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
  parentName = null,
}: CommentThreadProps) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const clampedDepth = Math.min(depth, 2);
        const flattenedPrefix = depth >= 2 && parentName ? `@${parentName} ` : "";

        return (
          <div
            key={comment.id}
            className="space-y-3 rounded-[24px] border border-[color:var(--color-moss)]/18 bg-white/70 p-4"
            style={{ marginLeft: clampedDepth * 14 }}
          >
            <div className="flex gap-3">
              <Avatar src={comment.author.avatarUrl} name={comment.author.displayName} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-forest)]">
                      {comment.author.displayName}
                    </p>
                    <p className="text-xs text-[color:var(--color-forest)]/60">
                      {formatFeedDate(comment.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {onReply ? (
                      <button
                        type="button"
                        onClick={() => onReply(comment)}
                        className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[color:var(--color-forest)]/75"
                      >
                        <MessageCircleReply className="h-4 w-4" />
                        Reply
                      </button>
                    ) : null}
                    {onDelete && currentUserId === comment.author.id ? (
                      <button
                        type="button"
                        onClick={() => onDelete(comment.id)}
                        className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[color:var(--color-ink)]/85">
                  {flattenedPrefix}
                  {comment.body}
                </p>
              </div>
            </div>

            {comment.replies.length ? (
              <CommentThread
                comments={comment.replies}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                depth={depth + 1}
                parentName={comment.author.displayName}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
