import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

type CommentTreeNode<T extends { id: string; parentId: string | null }> = T & {
  replies: Array<CommentTreeNode<T>>;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFeedDate(value: string | Date) {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatDetailDate(value: string | Date) {
  return format(new Date(value), "EEEE, MMMM d, yyyy");
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export function formatRadius(radiusMeters: number | null) {
  if (!radiusMeters) {
    return null;
  }

  if (radiusMeters >= 1000) {
    return `${(radiusMeters / 1000).toFixed(1)} km radius`;
  }

  return `${Math.round(radiusMeters)} m radius`;
}

export function getLocationLabel(
  latitude: number,
  longitude: number,
  locationType: "PINPOINT" | "AREA",
  radiusMeters: number | null,
) {
  const coords = formatCoordinates(latitude, longitude);

  if (locationType === "AREA") {
    return `${coords} · ${formatRadius(radiusMeters) ?? "Area"}`;
  }

  return coords;
}

export function buildCommentTree<T extends { id: string; parentId: string | null }>(
  comments: T[],
) {
  const byId = new Map<string, CommentTreeNode<T>>();
  const roots: Array<CommentTreeNode<T>> = [];

  for (const comment of comments) {
    byId.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = byId.get(comment.id)!;

    if (comment.parentId) {
      const parent = byId.get(comment.parentId);

      if (parent) {
        parent.replies.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  const sortTree = (nodes: Array<CommentTreeNode<T>>) => {
    nodes.sort((a, b) => {
      const aDate = "createdAt" in a ? new Date(String(a.createdAt)).getTime() : 0;
      const bDate = "createdAt" in b ? new Date(String(b.createdAt)).getTime() : 0;
      return aDate - bDate;
    });
    nodes.forEach((node) => sortTree(node.replies));
  };

  sortTree(roots);
  return roots;
}

export function sanitizeCommentBody(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim();
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getCursorDate(cursor: string | null) {
  if (!cursor) {
    return null;
  }

  const date = new Date(cursor);
  return Number.isNaN(date.getTime()) ? null : date;
}
