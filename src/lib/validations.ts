import { z } from "zod";

const dataUri = z
  .string()
  .min(20)
  .regex(/^data:image\/(png|jpe?g|webp|gif);base64,/i, "Expected an image data URI");

const coordinate = z.number().finite();

export const syncUserSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  avatarUrl: z.string().trim().url().or(dataUri).nullable().optional(),
});

export const createSightingSchema = z
  .object({
    birdName: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).nullable().optional(),
    date: z.coerce.date(),
    latitude: coordinate.min(-90).max(90),
    longitude: coordinate.min(-180).max(180),
    locationType: z.enum(["PINPOINT", "AREA"]),
    radiusMeters: z.number().positive().max(5000).nullable().optional(),
    imageData: dataUri,
    thumbnailData: dataUri.nullable().optional(),
    caption: z.string().trim().max(180).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.locationType === "AREA" && !value.radiusMeters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["radiusMeters"],
        message: "Radius is required for area sightings",
      });
    }

    if (value.locationType === "PINPOINT" && value.radiusMeters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["radiusMeters"],
        message: "Radius must be empty for pinpoint sightings",
      });
    }
  });

export const addPhotoSchema = z.object({
  imageData: dataUri,
  thumbnailData: dataUri.nullable().optional(),
  caption: z.string().trim().max(180).nullable().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(500),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  avatarUrl: z.string().trim().url().or(dataUri).nullable().optional(),
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
