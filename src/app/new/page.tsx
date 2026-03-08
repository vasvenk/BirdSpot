"use client";
/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { AuthGuard } from "@/components/AuthGuard";
import { prepareUploadImages } from "@/lib/imageUtils";
import { useGeolocation } from "@/hooks/useGeolocation";

const DynamicLocationPicker = dynamic(
  () => import("@/components/LocationPicker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-[28px] bg-[color:var(--color-moss)]/12" />,
  },
);

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function NewSightingPage() {
  const router = useRouter();
  const geolocation = useGeolocation();
  const [birdName, setBirdName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [locationType, setLocationType] = useState<"PINPOINT" | "AREA">("PINPOINT");
  const [radiusMeters, setRadiusMeters] = useState(250);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      return;
    }

    setProcessingImage(true);

    try {
      const images = await prepareUploadImages(file);
      setImageData(images.imageData);
      setThumbnailData(images.thumbnailData);
      toast.success("Photo prepared for upload");
    } catch {
      toast.error("Unable to process that image");
    } finally {
      setProcessingImage(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6 pb-34">
        <div className="space-y-2">
          <h1 className="font-[family:var(--font-display)] text-3xl text-[color:var(--color-forest)]">
            New sighting
          </h1>
          <p className="max-w-md text-sm leading-6 text-[color:var(--color-ink)]/78">
            Add the bird name, date, compressed photo, and either an exact point or a broader area.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!imageData || !location) {
              toast.error("Add a photo and choose a location first");
              return;
            }

            setSubmitting(true);

            try {
              const response = await fetch("/api/sightings", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  birdName,
                  description: description || null,
                  date,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  locationType,
                  radiusMeters: locationType === "AREA" ? radiusMeters : null,
                  imageData,
                  thumbnailData,
                  caption: photoCaption || null,
                }),
              });

              const payload = await response.json();

              if (!response.ok) {
                throw new Error(payload?.error ?? "Unable to create sighting");
              }

              toast.success("Sighting posted");
              router.replace(`/sighting/${payload.id}`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to create sighting");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_32px_rgba(62,86,60,0.08)]">
            <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">
              Bird name
            </label>
            <input
              value={birdName}
              onChange={(event) => setBirdName(event.target.value)}
              required
              placeholder="Great blue heron"
              className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
            />
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_32px_rgba(62,86,60,0.08)]">
            <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">
              Date observed
            </label>
            <input
              value={date}
              onChange={(event) => setDate(event.target.value)}
              type="date"
              required
              className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
            />
          </div>

          <div className="space-y-3 rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_32px_rgba(62,86,60,0.08)]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
                className="block min-h-12 w-full text-sm text-[color:var(--color-forest)]"
              />
            </div>

            <label className="block text-sm font-semibold text-[color:var(--color-forest)]">
              Caption
            </label>
            <input
              value={photoCaption}
              onChange={(event) => setPhotoCaption(event.target.value)}
              placeholder="Gliding over the marsh"
              className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
            />

            {processingImage ? (
              <div className="rounded-2xl bg-[color:var(--color-moss)]/12 px-4 py-3 text-sm text-[color:var(--color-forest)]/78">
                Compressing image…
              </div>
            ) : null}

            {imageData ? (
              <img src={imageData} alt="Selected upload preview" className="rounded-[24px] object-cover" />
            ) : null}
          </div>

          <div className="space-y-4 rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_32px_rgba(62,86,60,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[color:var(--color-forest)]">Location</h2>
                <p className="text-xs text-[color:var(--color-forest)]/65">
                  Tap the map to place a point.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (geolocation.coords) {
                    setLocation(geolocation.coords);
                  } else {
                    toast.error("Current location is not available yet");
                  }
                }}
                className="min-h-11 rounded-full bg-[color:var(--color-moss)]/14 px-4 text-sm font-semibold text-[color:var(--color-forest)]"
              >
                Use my location
              </button>
            </div>

            <DynamicLocationPicker value={location} onChange={setLocation} />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocationType("PINPOINT")}
                className={
                  locationType === "PINPOINT"
                    ? "min-h-11 rounded-2xl bg-[color:var(--color-forest)] text-sm font-semibold text-white"
                    : "min-h-11 rounded-2xl bg-[color:var(--color-moss)]/12 text-sm font-semibold text-[color:var(--color-forest)]"
                }
              >
                Exact spot
              </button>
              <button
                type="button"
                onClick={() => setLocationType("AREA")}
                className={
                  locationType === "AREA"
                    ? "min-h-11 rounded-2xl bg-[color:var(--color-forest)] text-sm font-semibold text-white"
                    : "min-h-11 rounded-2xl bg-[color:var(--color-moss)]/12 text-sm font-semibold text-[color:var(--color-forest)]"
                }
              >
                General area
              </button>
            </div>

            {locationType === "AREA" ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[color:var(--color-forest)]">
                  Radius: {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters} m`}
                </label>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={radiusMeters}
                  onChange={(event) => setRadiusMeters(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            ) : null}

            {location ? (
              <p className="text-xs text-[color:var(--color-forest)]/65">
                Selected: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            ) : null}
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_32px_rgba(62,86,60,0.08)]">
            <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe the call, movement, or habitat."
              className="w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[color:var(--color-forest)] px-5 py-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Posting sighting…" : "Post sighting"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
