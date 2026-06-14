// Single source of truth for what counts as a "complete" profile, used by both
// the config endpoint (to drive the home nudge) and the user update (to stamp
// profileCompletedAt — i.e. track who actually finished theirs).

export type CompletenessInput = {
  company?: string | null;
  college?: string | null;
  showcase?: unknown;
};

export function profileMissingFields(u: CompletenessInput): string[] {
  const missing: string[] = [];
  if (!u.company || !u.company.trim()) missing.push('company');
  if (!u.college || !u.college.trim()) missing.push('education');
  const showcase = u.showcase;
  if (!Array.isArray(showcase) || showcase.length === 0) missing.push('showcase');
  return missing;
}

export function isProfileComplete(u: CompletenessInput): boolean {
  return profileMissingFields(u).length === 0;
}
