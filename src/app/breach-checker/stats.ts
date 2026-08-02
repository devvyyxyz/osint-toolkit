/**
 * Breach statistics computation.
 */

import type { BreachCheckResult, BreachStats } from "./types";

export function computeStats(result: BreachCheckResult): BreachStats {
  const dataClassMap = new Map<string, number>();
  for (const breach of result.breaches) {
    for (const dc of breach.dataClasses) {
      dataClassMap.set(dc, (dataClassMap.get(dc) || 0) + 1);
    }
  }
  const dataClassCounts = Array.from(dataClassMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const uniqueDataClasses = dataClassCounts.map((d) => d.name);

  const dates = result.breaches
    .map((b) => new Date(b.breachDate).getTime())
    .filter((t) => !isNaN(t));
  const earliestBreach =
    dates.length > 0
      ? new Date(Math.min(...dates)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;
  const latestBreach =
    dates.length > 0
      ? new Date(Math.max(...dates)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  // Severity assessment
  let severityLabel: string;
  let severityDescription: string;
  let severityColor: string;
  let severityBg: string;

  if (result.breachCount >= 10) {
    severityLabel = "Critical — extensive exposure";
    severityDescription = `This account appears in ${result.breachCount} breaches spanning ${uniqueDataClasses.length} types of personal data. Take immediate action.`;
    severityColor = "text-red-700 dark:text-red-300";
    severityBg = "bg-red-500/10";
  } else if (result.breachCount >= 5) {
    severityLabel = "High — multiple breaches";
    severityDescription = `This account appears in ${result.breachCount} breaches. Change passwords and enable 2FA on all important accounts.`;
    severityColor = "text-red-700 dark:text-red-300";
    severityBg = "bg-red-500/10";
  } else if (result.breachCount >= 2) {
    severityLabel = "Moderate — repeated exposure";
    severityDescription = `This account appears in ${result.breachCount} breaches. Review which data was exposed and update affected credentials.`;
    severityColor = "text-amber-700 dark:text-amber-300";
    severityBg = "bg-amber-500/10";
  } else {
    severityLabel = "Low — single breach";
    severityDescription = `This account appears in 1 breach. Check the details below and update your credentials for the affected service.`;
    severityColor = "text-amber-700 dark:text-amber-300";
    severityBg = "bg-amber-500/10";
  }

  return {
    uniqueDataClasses,
    dataClassCounts,
    earliestBreach,
    latestBreach,
    severityLabel,
    severityDescription,
    severityColor,
    severityBg,
  };
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
