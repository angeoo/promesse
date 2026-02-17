type AttemptState = {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number;
};

const store = new Map<string, AttemptState>();

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export function checkRateLimit(params: {
  key: string;
  maxAttempts: number;
  windowMs: number;
  blockMs: number;
}): RateLimitDecision {
  const now = Date.now();
  const current = store.get(params.key);

  if (!current) {
    store.set(params.key, {
      count: 0,
      firstAttemptAt: now,
      blockedUntil: 0
    });
    return { allowed: true };
  }

  if (current.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.blockedUntil - now) / 1000)
    };
  }

  if (now - current.firstAttemptAt > params.windowMs) {
    store.set(params.key, {
      count: 0,
      firstAttemptAt: now,
      blockedUntil: 0
    });
    return { allowed: true };
  }

  if (current.count >= params.maxAttempts) {
    current.blockedUntil = now + params.blockMs;
    store.set(params.key, current);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(params.blockMs / 1000)
    };
  }

  return { allowed: true };
}

export function registerFailure(params: {
  key: string;
  windowMs: number;
}) {
  const now = Date.now();
  const current = store.get(params.key);

  if (!current || now - current.firstAttemptAt > params.windowMs) {
    store.set(params.key, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0
    });
    return;
  }

  current.count += 1;
  store.set(params.key, current);
}

export function resetRateLimitKey(key: string) {
  store.delete(key);
}

export function consumeRateLimit(params: {
  key: string;
  maxAttempts: number;
  windowMs: number;
  blockMs: number;
}): RateLimitDecision {
  const decision = checkRateLimit(params);
  if (!decision.allowed) return decision;

  registerFailure({ key: params.key, windowMs: params.windowMs });
  return { allowed: true };
}

export function clearRateLimitStore() {
  store.clear();
}
