/**
 * ==========================================
 * SkillMint Serializer & JSON Utilities
 * ==========================================
 * Standardizes database input/output transformations:
 * Parses JSON array string data safely to real arrays for client payloads.
 */

/**
 * User record parser serializer:
 * Decodes serialized 'skills' lists into standard client JSON arrays.
 */
export function serializeUser(user) {
  if (!user) return user;
  return {
    ...user,
    skills: parseJson(user.skills, []),
  };
}

/**
 * Gig record parser serializer:
 * Decodes tags, images, nested users, and pricing packages arrays.
 */
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

/**
 * Robust JSON parsing utility with standard fallback mechanisms.
 */
export function parseJson(val, fallback = []) {
  if (Array.isArray(val)) return val;
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

/**
 * Array parser converting JavaScript lists to db-compatible JSON strings.
 */
export function stringifyArray(arr) {
  if (!arr) return '[]';
  if (typeof arr === 'string') return arr;
  return JSON.stringify(arr);
}
