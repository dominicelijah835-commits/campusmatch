export interface Lifestyle {
  study_habit?: string | null;
  sleep_cycle?: string | null;
  guest_policy?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  location_preference?: string | null;
}

export function matchScore(a: Lifestyle, b: Lifestyle): number {
  let score = 0;
  let total = 0;
  const fields: (keyof Lifestyle)[] = ["study_habit", "sleep_cycle", "guest_policy", "location_preference"];
  for (const f of fields) {
    if (a[f] && b[f]) {
      total += 25;
      if (a[f] === b[f]) score += 25;
    }
  }
  // budget overlap
  if (a.budget_min != null && a.budget_max != null && b.budget_min != null && b.budget_max != null) {
    total += 0; // already covered by 100 baseline below
    const overlap = Math.max(0, Math.min(a.budget_max, b.budget_max) - Math.max(a.budget_min, b.budget_min));
    const range = Math.max(a.budget_max - a.budget_min, b.budget_max - b.budget_min, 1);
    score = score * 0.8 + (overlap / range) * 20;
    return Math.round(Math.min(100, Math.max(5, score)));
  }
  return total === 0 ? 50 : Math.round((score / total) * 100);
}
