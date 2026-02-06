import type { FrequencyPeriod, UseCaseMetrics, UseCaseScore, ScoreGrade } from '../types';

export function calculateMetrics(input: {
  timeSavedPerUseMinutes: number;
  moneySavedPerUse: number;
  numberOfUsers: number;
  usesPerUserPerPeriod: number;
  frequencyPeriod: FrequencyPeriod;
}): UseCaseMetrics {
  const {
    timeSavedPerUseMinutes,
    moneySavedPerUse,
    numberOfUsers,
    usesPerUserPerPeriod,
    frequencyPeriod,
  } = input;

  // Convert to daily total uses based on frequency period
  let totalUsesPerDay: number;
  if (frequencyPeriod === 'daily') {
    totalUsesPerDay = numberOfUsers * usesPerUserPerPeriod;
  } else if (frequencyPeriod === 'weekly') {
    totalUsesPerDay = (numberOfUsers * usesPerUserPerPeriod) / 7;
  } else {
    totalUsesPerDay = (numberOfUsers * usesPerUserPerPeriod) / 30;
  }

  // Time projections
  const dailyTimeSavedMinutes = totalUsesPerDay * timeSavedPerUseMinutes;
  const weeklyTimeSavedMinutes = dailyTimeSavedMinutes * 7;
  const monthlyTimeSavedHours = (dailyTimeSavedMinutes * 30) / 60;
  const annualTimeSavedHours = (dailyTimeSavedMinutes * 365) / 60;

  // Money projections
  const dailyMoneySaved = totalUsesPerDay * moneySavedPerUse;
  const weeklyMoneySaved = dailyMoneySaved * 7;
  const monthlyMoneySaved = dailyMoneySaved * 30;
  const annualMoneySaved = dailyMoneySaved * 365;

  return {
    timeSavedPerUseMinutes,
    moneySavedPerUse,
    numberOfUsers,
    usesPerUserPerPeriod,
    frequencyPeriod,
    // Backward compat
    timeSavedHours: annualTimeSavedHours,
    moneySavedDollars: annualMoneySaved,
    // Projections
    dailyTimeSavedMinutes,
    dailyMoneySaved,
    weeklyTimeSavedMinutes,
    weeklyMoneySaved,
    monthlyTimeSavedHours,
    monthlyMoneySaved,
    annualTimeSavedHours,
    annualMoneySaved,
  };
}

export function getGrade(score: number): ScoreGrade {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

export function getQuadrant(
  valueScore: number,
  scaleScore: number
): UseCaseScore['quadrant'] {
  const highValue = valueScore >= 50;
  const highScale = scaleScore >= 50;
  if (highValue && highScale) return 'high-value-high-scale';
  if (highValue && !highScale) return 'high-value-low-scale';
  if (!highValue && highScale) return 'low-value-high-scale';
  return 'low-value-low-scale';
}

export function calculateScore(metrics: UseCaseMetrics): UseCaseScore {
  // Value per use: convert time to dollars at $50/hr, add money saved
  const dollarValuePerUse =
    (metrics.timeSavedPerUseMinutes * 50) / 60 + metrics.moneySavedPerUse;
  const valuePerUse = Math.min(
    100,
    Math.log10(dollarValuePerUse + 1) * 33
  );

  // Scale factor: monthly total uses
  let usesPerMonth: number;
  if (metrics.frequencyPeriod === 'daily') {
    usesPerMonth = metrics.numberOfUsers * metrics.usesPerUserPerPeriod * 30;
  } else if (metrics.frequencyPeriod === 'weekly') {
    usesPerMonth =
      metrics.numberOfUsers * metrics.usesPerUserPerPeriod * (30 / 7);
  } else {
    usesPerMonth = metrics.numberOfUsers * metrics.usesPerUserPerPeriod;
  }
  const scaleFactor = Math.min(
    100,
    Math.log10(usesPerMonth + 1) * 33
  );

  const overallScore = Math.round(Math.sqrt(valuePerUse * scaleFactor));
  const grade = getGrade(overallScore);
  const quadrant = getQuadrant(valuePerUse, scaleFactor);

  return { valuePerUse, scaleFactor, overallScore, grade, quadrant };
}

export function formatTime(minutes: number): string {
  if (minutes < 1) return '0m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatMoney(dollars: number): string {
  if (dollars < 0) return `-${formatMoney(-dollars)}`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 10_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  if (dollars >= 1_000) return `$${Math.round(dollars).toLocaleString()}`;
  return `$${Math.round(dollars)}`;
}
