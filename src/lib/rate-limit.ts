type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var birdSpotRateLimitStore: Map<string, Bucket> | undefined;
}

const store = global.birdSpotRateLimitStore ?? new Map<string, Bucket>();

if (!global.birdSpotRateLimitStore) {
  global.birdSpotRateLimitStore = store;
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}
