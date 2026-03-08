export type AppUser = {
  id: string;
  supabaseId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type SightingPhoto = {
  id: string;
  sightingId: string;
  uploaderId: string;
  imageData: string;
  thumbnailData: string | null;
  caption: string | null;
  createdAt: string;
  uploader: Pick<AppUser, "id" | "displayName" | "avatarUrl">;
};

export type CommentNode = {
  id: string;
  sightingId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  author: Pick<AppUser, "id" | "displayName" | "avatarUrl">;
  replies: CommentNode[];
};

export type SightingSummary = {
  id: string;
  birdName: string;
  description: string | null;
  date: string;
  latitude: number;
  longitude: number;
  locationType: "PINPOINT" | "AREA";
  radiusMeters: number | null;
  likesCount: number;
  createdAt: string;
  updatedAt?: string;
  author: Pick<AppUser, "id" | "displayName" | "avatarUrl">;
  firstPhoto: Pick<SightingPhoto, "id" | "thumbnailData" | "imageData" | "caption"> | null;
  commentCount: number;
};

export type SightingDetail = {
  id: string;
  birdName: string;
  description: string | null;
  date: string;
  latitude: number;
  longitude: number;
  locationType: "PINPOINT" | "AREA";
  radiusMeters: number | null;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author: Pick<AppUser, "id" | "displayName" | "avatarUrl">;
  photos: SightingPhoto[];
  comments: CommentNode[];
  commentCount: number;
  likedByViewer: boolean;
};

export type PaginatedSightingsResponse = {
  items: SightingSummary[];
  nextCursor: string | null;
};

export type SightingMarkersResponse = {
  items: SightingSummary[];
};

export type CurrentUserResponse = {
  user: AppUser;
  sightingsCount: number;
};
