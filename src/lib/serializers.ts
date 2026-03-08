import type { Prisma } from "@/generated/prisma";

import { buildCommentTree } from "@/lib/utils";

export const sightingSummaryInclude = {
  author: true,
  photos: {
    take: 1,
    orderBy: {
      createdAt: "asc",
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.SightingInclude;

export const sightingDetailInclude = {
  author: true,
  photos: {
    include: {
      uploader: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  comments: {
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.SightingInclude;

type SummaryRecord = Prisma.SightingGetPayload<{
  include: typeof sightingSummaryInclude;
}>;

type DetailRecord = Prisma.SightingGetPayload<{
  include: typeof sightingDetailInclude;
}>;

type FlatCommentRecord = DetailRecord["comments"][number];

export function serializeSightingSummary(sighting: SummaryRecord) {
  const firstPhoto = sighting.photos[0];

  return {
    id: sighting.id,
    birdName: sighting.birdName,
    description: sighting.description,
    date: sighting.date.toISOString(),
    latitude: sighting.latitude,
    longitude: sighting.longitude,
    locationType: sighting.locationType,
    radiusMeters: sighting.radiusMeters,
    likesCount: sighting.likesCount,
    createdAt: sighting.createdAt.toISOString(),
    updatedAt: sighting.updatedAt.toISOString(),
    author: {
      id: sighting.author.id,
      displayName: sighting.author.displayName,
      avatarUrl: sighting.author.avatarUrl,
    },
    firstPhoto: firstPhoto
      ? {
          id: firstPhoto.id,
          imageData: firstPhoto.imageData,
          thumbnailData: firstPhoto.thumbnailData,
          caption: firstPhoto.caption,
        }
      : null,
    commentCount: sighting._count.comments,
  };
}

function serializeFlatComment(comment: FlatCommentRecord) {
  return {
    id: comment.id,
    sightingId: comment.sightingId,
    authorId: comment.authorId,
    parentId: comment.parentId,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author.id,
      displayName: comment.author.displayName,
      avatarUrl: comment.author.avatarUrl,
    },
  };
}

export function serializeCommentsTree(comments: FlatCommentRecord[]) {
  return buildCommentTree(comments.map(serializeFlatComment));
}

export function serializeSightingDetail(sighting: DetailRecord, likedByViewer: boolean) {
  return {
    id: sighting.id,
    birdName: sighting.birdName,
    description: sighting.description,
    date: sighting.date.toISOString(),
    latitude: sighting.latitude,
    longitude: sighting.longitude,
    locationType: sighting.locationType,
    radiusMeters: sighting.radiusMeters,
    likesCount: sighting.likesCount,
    createdAt: sighting.createdAt.toISOString(),
    updatedAt: sighting.updatedAt.toISOString(),
    author: {
      id: sighting.author.id,
      displayName: sighting.author.displayName,
      avatarUrl: sighting.author.avatarUrl,
    },
    photos: sighting.photos.map((photo) => ({
      id: photo.id,
      sightingId: photo.sightingId,
      uploaderId: photo.uploaderId,
      imageData: photo.imageData,
      thumbnailData: photo.thumbnailData,
      caption: photo.caption,
      createdAt: photo.createdAt.toISOString(),
      uploader: {
        id: photo.uploader.id,
        displayName: photo.uploader.displayName,
        avatarUrl: photo.uploader.avatarUrl,
      },
    })),
    comments: serializeCommentsTree(sighting.comments),
    commentCount: sighting._count.comments,
    likedByViewer,
  };
}
