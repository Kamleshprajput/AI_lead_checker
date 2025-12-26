export function decayPriority(halfLife: number) {
  if (halfLife <= 30) return "CRITICAL";
  if (halfLife <= 120) return "HIGH";
  if (halfLife <= 1440) return "MEDIUM";
  return "LOW";
}
