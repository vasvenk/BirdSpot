"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Camera, MapPinned, Trash2 } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { CommentInput } from "@/components/CommentInput";
import { CommentThread } from "@/components/CommentThread";
import { LikeButton } from "@/components/LikeButton";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { fetchJson } from "@/lib/fetcher";
import { prepareUploadImages } from "@/lib/imageUtils";
import { formatDetailDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { CommentNode, SightingDetail, SightingSummary } from "@/types";

const DynamicSightingMap = dynamic(
  () => import("@/components/SightingMap").then((mod) => mod.SightingMap),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-[28px] bg-[color:var(--color-moss)]/12" />,
  },
);

export default function SightingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { appUser, isAuthenticated } = useAuth();
  const [replyTo, setReplyTo] = useState<CommentNode | null>(null);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const sightingId = params.id;
  const { data, error, isLoading, mutate } = useSWR<SightingDetail>(
    sightingId ? `/api/sightings/${sightingId}` : null,
    fetchJson,
  );

  if (isLoading) {
    return <div className="h-[50vh] animate-pulse rounded-[30px] bg-[color:var(--color-moss)]/12" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-[30px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Unable to load that sighting.
      </div>
    );
  }

  const mapSummary: SightingSummary = {
    id: data.id,
    birdName: data.birdName,
    description: data.description,
    date: data.date,
    latitude: data.latitude,
    longitude: data.longitude,
    locationType: data.locationType,
    radiusMeters: data.radiusMeters,
    likesCount: data.likesCount,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: data.author,
    firstPhoto: data.photos[0]
      ? {
          id: data.photos[0].id,
          imageData: data.photos[0].imageData,
          thumbnailData: data.photos[0].thumbnailData,
          caption: data.photos[0].caption,
        }
      : null,
    commentCount: data.commentCount,
  };

  return (
    <div className="space-y-6 pb-34">
      <div className="space-y-4 rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(62,86,60,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={data.author.avatarUrl} name={data.author.displayName} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--color-forest)]">
                {data.author.displayName}
              </p>
              <p className="text-xs text-[color:var(--color-forest)]/62">{formatDetailDate(data.date)}</p>
            </div>
          </div>

          {appUser?.id === data.author.id ? (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm("Delete this sighting and all related photos, likes, and comments?")) {
                  return;
                }

                const response = await fetch(`/api/sightings/${data.id}`, {
                  method: "DELETE",
                  credentials: "include",
                });
                const payload = await response.json();

                if (!response.ok) {
                  toast.error(payload?.error ?? "Unable to delete sighting");
                  return;
                }

                toast.success("Sighting deleted");
                router.replace("/");
              }}
              className="flex min-h-11 items-center gap-2 rounded-full bg-rose-50 px-4 text-sm font-semibold text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : null}
        </div>

        <div>
          <h1 className="font-[family:var(--font-display)] text-4xl text-[color:var(--color-forest)]">
            {data.birdName}
          </h1>
          {data.description ? (
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink)]/82">{data.description}</p>
          ) : null}
        </div>

        <PhotoCarousel photos={data.photos} />

        <div className="grid grid-cols-2 gap-3">
          <LikeButton
            sightingId={data.id}
            initialLiked={data.likedByViewer}
            initialCount={data.likesCount}
            onChange={(next) =>
              void mutate(
                (current) =>
                  current
                    ? {
                        ...current,
                        likedByViewer: next.liked,
                        likesCount: next.likesCount,
                      }
                    : current,
                { revalidate: false },
              )
            }
          />
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                router.push(`/login?redirect=${encodeURIComponent(`/sighting/${data.id}`)}`);
                return;
              }
              setAddingPhoto((current) => !current);
            }}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-moss)]/12 px-4 text-sm font-semibold text-[color:var(--color-forest)]"
          >
            <Camera className="h-4 w-4" />
            Add photo
          </button>
        </div>

        {addingPhoto ? (
          <div className="space-y-3 rounded-[26px] border border-[color:var(--color-moss)]/20 bg-[color:var(--color-paper)] p-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
              className="block min-h-11 w-full text-sm"
            />
            <input
              value={photoCaption}
              onChange={(event) => setPhotoCaption(event.target.value)}
              placeholder="Add a caption"
              className="min-h-11 w-full rounded-2xl border border-[color:var(--color-moss)]/24 bg-white px-4 text-sm"
            />
            <button
              type="button"
              disabled={photoSubmitting}
              onClick={async () => {
                if (!photoFile) {
                  toast.error("Choose an image first");
                  return;
                }

                setPhotoSubmitting(true);

                try {
                  const images = await prepareUploadImages(photoFile);
                  const response = await fetch(`/api/sightings/${data.id}/photos`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      imageData: images.imageData,
                      thumbnailData: images.thumbnailData,
                      caption: photoCaption || null,
                    }),
                  });
                  const payload = await response.json();

                  if (!response.ok) {
                    throw new Error(payload?.error ?? "Unable to add photo");
                  }

                  toast.success("Photo added");
                  setAddingPhoto(false);
                  setPhotoFile(null);
                  setPhotoCaption("");
                  await mutate();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to add photo");
                } finally {
                  setPhotoSubmitting(false);
                }
              }}
              className="min-h-11 rounded-full bg-[color:var(--color-forest)] px-4 text-sm font-semibold text-white disabled:opacity-45"
            >
              {photoSubmitting ? "Uploading…" : "Upload photo"}
            </button>
          </div>
        ) : null}
      </div>

      <section className="space-y-4 rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(62,86,60,0.08)]">
        <div className="flex items-center gap-2 text-[color:var(--color-forest)]">
          <MapPinned className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Sighting location</h2>
        </div>
        <DynamicSightingMap sightings={[mapSummary]} className="h-72 overflow-hidden rounded-[28px]" />
      </section>

      <section className="space-y-4 rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(62,86,60,0.08)]">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--color-forest)]">
            Comments ({data.commentCount})
          </h2>
          <p className="text-sm text-[color:var(--color-forest)]/68">
            Nested replies display up to two levels deep.
          </p>
        </div>

        {data.comments.length ? (
          <CommentThread
            comments={data.comments}
            currentUserId={appUser?.id}
            onReply={setReplyTo}
            onDelete={async (commentId) => {
              const response = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
                credentials: "include",
              });
              const payload = await response.json();

              if (!response.ok) {
                toast.error(payload?.error ?? "Unable to delete comment");
                return;
              }

              toast.success("Comment removed");
              await mutate();
            }}
          />
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--color-moss)]/30 bg-[color:var(--color-paper)] p-6 text-center text-sm text-[color:var(--color-forest)]/72">
            No comments yet. Add the first note from the field.
          </div>
        )}

        {isAuthenticated ? (
          <CommentInput
            loading={commentSubmitting}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSubmit={async (body) => {
              setCommentSubmitting(true);

              try {
                const response = await fetch(`/api/sightings/${data.id}/comments`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    body,
                    parentId: replyTo?.id ?? null,
                  }),
                });
                const payload = await response.json();

                if (!response.ok) {
                  throw new Error(payload?.error ?? "Unable to add comment");
                }

                setReplyTo(null);
                await mutate();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to add comment");
              } finally {
                setCommentSubmitting(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/sighting/${data.id}`)}`)}
            className="sticky bottom-24 min-h-12 w-full rounded-full bg-[color:var(--color-forest)] px-4 text-sm font-semibold text-white"
          >
            Log in to comment
          </button>
        )}
      </section>
    </div>
  );
}
