// Helpers for SQLite JSON array fields
// SQLite doesn't support native arrays, so we store them as JSON strings

export function serializeUser(user) {
  if (!user) return user;
  return {
    ...user,
    skills: parseJson(user.skills, []),
  };
}

export function serializeGig(gig) {
  if (!gig) return gig;
  return {
    ...gig,
    tags: parseJson(gig.tags, []),
    images: parseJson(gig.images, []),
    user: gig.user ? serializeUser(gig.user) : undefined,
    packages: gig.packages || [],
  };
}

export function parseJson(val, fallback = []) {
  if (Array.isArray(val)) return val;
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

export function stringifyArray(arr) {
  if (!arr) return '[]';
  if (typeof arr === 'string') return arr;
  return JSON.stringify(arr);
}
