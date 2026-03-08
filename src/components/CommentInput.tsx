"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

import type { CommentNode } from "@/types";

type CommentInputProps = {
  loading?: boolean;
  replyTo?: CommentNode | null;
  onCancelReply?: () => void;
  onSubmit: (body: string) => Promise<void>;
};

export function CommentInput({
  loading = false,
  replyTo = null,
  onCancelReply,
  onSubmit,
}: CommentInputProps) {
  const [value, setValue] = useState("");

  return (
    <div className="sticky bottom-24 z-20 rounded-[26px] border border-white/70 bg-[color:var(--color-card)]/95 p-3 shadow-[0_10px_30px_rgba(59,92,68,0.12)] backdrop-blur">
      {replyTo ? (
        <div className="mb-2 flex items-center justify-between rounded-2xl bg-[color:var(--color-moss)]/12 px-3 py-2 text-xs text-[color:var(--color-forest)]/80">
          Replying to {replyTo.author.displayName}
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Share what you noticed…"
          rows={2}
          className="min-h-11 flex-1 resize-none rounded-[22px] border border-[color:var(--color-moss)]/25 bg-white px-4 py-3 text-sm outline-none ring-0"
        />
        <button
          type="button"
          disabled={loading || !value.trim()}
          onClick={async () => {
            const next = value.trim();
            if (!next) {
              return;
            }
            await onSubmit(next);
            setValue("");
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-forest)] text-white disabled:opacity-45"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
