export interface CalculationResult {
  basePrice: number;
  gstOnBasePrice: number;
  priceAfterGst: number;
  processingFee: number;
  gstOnProcessingFee: number;
  finalAIP: number;
  rawValues?: {
    basePrice: number;
    gstOnBasePrice: number;
    priceAfterGst: number;
    processingFee: number;
    gstOnProcessingFee: number;
    finalAIP: number;
  };
  matchInfo?: {
    targetAIP: number;
    estimatedBase: number;
    refinedBase: number;
    achievedAIP: number;
    delta: number;
    isExactMatch: boolean;
    nearbyOptions?: Array<{
      aip: number;
      basePrice: number;
    }>;
  };
}

function roundToPrecision(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

export function calculateAIP(
  basePrice: number,
  gstPercent: number,
  processingFeePercent: number,
  gstOnProcessingFeePercent: number,
  precision: number = 5
): CalculationResult {
  const rawGstOnBasePrice = basePrice * (gstPercent / 100);
  const gstOnBasePrice = roundToPrecision(rawGstOnBasePrice, precision);

  const rawPriceAfterGst = basePrice + gstOnBasePrice;
  const priceAfterGst = roundToPrecision(rawPriceAfterGst, precision);

  const rawProcessingFee = priceAfterGst * (processingFeePercent / 100);
  const processingFee = roundToPrecision(rawProcessingFee, precision);

  const rawGstOnProcessingFee = processingFee * (gstOnProcessingFeePercent / 100);
  const gstOnProcessingFee = roundToPrecision(rawGstOnProcessingFee, precision);

  const rawFinalAIP = basePrice + gstOnBasePrice + processingFee + gstOnProcessingFee;
  const finalAIP = roundToPrecision(rawFinalAIP, precision);

  return {
    basePrice: roundToPrecision(basePrice, precision),
    gstOnBasePrice,
    priceAfterGst,
    processingFee,
    gstOnProcessingFee,
    finalAIP,
    rawValues: {
      basePrice,
      gstOnBasePrice: rawGstOnBasePrice,
      priceAfterGst: rawPriceAfterGst,
      processingFee: rawProcessingFee,
      gstOnProcessingFee: rawGstOnProcessingFee,
      finalAIP: rawFinalAIP,
    },
  };
}

export interface ForwardRoundedResult {
  basePrice: number;
  gstOnBasePrice: number;
  priceAfterGst: number;
  processingFee: number;
  gstOnProcessingFee: number;
  finalAIP: number;
}

export function forwardRounded(
  basePrice: number,
  gstPercent: number,
  processingFeePercent: number,
  gstOnProcessingFeePercent: number
): ForwardRoundedResult {
  const g = gstPercent / 100;
  const p = processingFeePercent / 100;
  const f = gstOnProcessingFeePercent / 100;

  const gstOnBase = roundToPrecision(basePrice * g, 2);
  const priceAfterGst = roundToPrecision(basePrice + gstOnBase, 2);
  const processingFee = roundToPrecision(priceAfterGst * p, 2);
  const gstOnProcessingFee = roundToPrecision(processingFee * f, 2);
  const finalAIP = roundToPrecision(priceAfterGst + processingFee + gstOnProcessingFee, 2);

  return {
    basePrice: roundToPrecision(basePrice, 2),
    gstOnBasePrice: gstOnBase,
    priceAfterGst,
    processingFee,
    gstOnProcessingFee,
    finalAIP,
  };
}

interface NjukoMatchResult {
  basePrice: number;
  isExactMatch: boolean;
  achievedAIP: number;
  delta: number;
  nearbyOptions: Array<{ aip: number; basePrice: number }>;
}

function findNjukoMatchBase(
  targetAIP: number,
  gstPercent: number,
  processingFeePercent: number,
  gstOnProcessingFeePercent: number,
  estimatedBase: number
): NjukoMatchResult {
  const targetRounded = roundToPrecision(targetAIP, 2);
  const searchRange = 2;
  const minBase = Math.max(0, estimatedBase - searchRange);
  const maxBase = estimatedBase + searchRange;

  const coarseStepSize = 0.001;
  let coarseMatches: Array<{ base: number; aip: number; diff: number }> = [];

  for (let base = minBase; base <= maxBase; base += coarseStepSize) {
    const result = forwardRounded(base, gstPercent, processingFeePercent, gstOnProcessingFeePercent);
    const diff = Math.abs(result.finalAIP - targetRounded);
    coarseMatches.push({ base, aip: result.finalAIP, diff });
  }

  coarseMatches.sort((a, b) => a.diff - b.diff);
  const topMatches = coarseMatches.slice(0, 10);

  let exactMatches: Array<{ base: number; aip: number }> = [];
  let closestBase = estimatedBase;
  let closestDiff = Infinity;
  let closestAIP = 0;

  for (const coarse of topMatches) {
    const fineMin = Math.max(0, coarse.base - coarseStepSize);
    const fineMax = coarse.base + coarseStepSize;
    const fineStepSize = 0.00001;

    for (let base = fineMin; base <= fineMax; base += fineStepSize) {
      const result = forwardRounded(base, gstPercent, processingFeePercent, gstOnProcessingFeePercent);
      const diff = Math.abs(result.finalAIP - targetRounded);

      if (diff < 0.00001) {
        exactMatches.push({ base, aip: result.finalAIP });
      }

      if (diff < closestDiff) {
        closestDiff = diff;
        closestBase = base;
        closestAIP = result.finalAIP;
      }
    }
  }

  let selectedBase: number;
  let isExactMatch: boolean;
  let achievedAIP: number;

  if (exactMatches.length > 0) {
    const bestMatch = exactMatches.reduce((best, current) => {
      const bestDiff = Math.abs(best.base - estimatedBase);
      const currentDiff = Math.abs(current.base - estimatedBase);
      if (Math.abs(bestDiff - currentDiff) < 0.00001) {
        return current.base < best.base ? current : best;
      }
      return currentDiff < bestDiff ? current : best;
    });
    selectedBase = bestMatch.base;
    achievedAIP = bestMatch.aip;
    isExactMatch = true;
  } else {
    selectedBase = closestBase;
    achievedAIP = closestAIP;
    isExactMatch = false;
  }

  const uniqueAIPs = new Map<number, number>();
  for (let base = minBase; base <= maxBase; base += 0.01) {
    const result = forwardRounded(base, gstPercent, processingFeePercent, gstOnProcessingFeePercent);
    if (!uniqueAIPs.has(result.finalAIP) || Math.abs(base - estimatedBase) < Math.abs(uniqueAIPs.get(result.finalAIP)! - estimatedBase)) {
      uniqueAIPs.set(result.finalAIP, base);
    }
  }

  const sortedAIPs = Array.from(uniqueAIPs.entries())
    .map(([aip, base]) => ({ aip, basePrice: base, diff: Math.abs(aip - targetRounded) }))
    .sort((a, b) => a.diff - b.diff);

  const nearbyOptions: Array<{ aip: number; basePrice: number }> = [];
  const addedAIPs = new Set<number>();

  for (const option of sortedAIPs) {
    if (nearbyOptions.length >= 3) break;
    if (!addedAIPs.has(option.aip)) {
      nearbyOptions.push({ aip: option.aip, basePrice: option.basePrice });
      addedAIPs.add(option.aip);
    }
  }

  const delta = roundToPrecision(achievedAIP - targetRounded, 2);

  return {
    basePrice: selectedBase,
    isExactMatch,
    achievedAIP,
    delta,
    nearbyOptions,
  };
}

export function calculateReverseAIP(
  finalAIP: number,
  gstPercent: number,
  processingFeePercent: number,
  gstOnProcessingFeePercent: number,
  precision: number = 5,
  useNjukoMatch: boolean = true
): CalculationResult {
  const g = gstPercent / 100;
  const p = processingFeePercent / 100;
  const f = gstOnProcessingFeePercent / 100;

  const rawBasePrice = finalAIP / ((1 + g) * (1 + p * (1 + f)));
  const estimatedBase = rawBasePrice;

  if (useNjukoMatch) {
    const matchResult = findNjukoMatchBase(finalAIP, gstPercent, processingFeePercent, gstOnProcessingFeePercent, estimatedBase);

    const njukoResult = forwardRounded(matchResult.basePrice, gstPercent, processingFeePercent, gstOnProcessingFeePercent);

    return {
      basePrice: roundToPrecision(matchResult.basePrice, precision),
      gstOnBasePrice: njukoResult.gstOnBasePrice,
      priceAfterGst: njukoResult.priceAfterGst,
      processingFee: njukoResult.processingFee,
      gstOnProcessingFee: njukoResult.gstOnProcessingFee,
      finalAIP: njukoResult.finalAIP,
      rawValues: {
        basePrice: rawBasePrice,
        gstOnBasePrice: matchResult.basePrice * g,
        priceAfterGst: matchResult.basePrice + (matchResult.basePrice * g),
        processingFee: (matchResult.basePrice + (matchResult.basePrice * g)) * p,
        gstOnProcessingFee: ((matchResult.basePrice + (matchResult.basePrice * g)) * p) * f,
        finalAIP,
      },
      matchInfo: {
        targetAIP: roundToPrecision(finalAIP, 2),
        estimatedBase,
        refinedBase: matchResult.basePrice,
        achievedAIP: matchResult.achievedAIP,
        delta: matchResult.delta,
        isExactMatch: matchResult.isExactMatch,
        nearbyOptions: matchResult.nearbyOptions,
      },
    };
  } else {
    const basePrice = roundToPrecision(estimatedBase, precision);

    const rawGstOnBasePrice = basePrice * g;
    const gstOnBasePrice = roundToPrecision(rawGstOnBasePrice, precision);

    const rawPriceAfterGst = basePrice + gstOnBasePrice;
    const priceAfterGst = roundToPrecision(rawPriceAfterGst, precision);

    const rawProcessingFee = priceAfterGst * p;
    const processingFee = roundToPrecision(rawProcessingFee, precision);

    const rawGstOnProcessingFee = processingFee * f;
    const gstOnProcessingFee = roundToPrecision(rawGstOnProcessingFee, precision);

    return {
      basePrice,
      gstOnBasePrice,
      priceAfterGst,
      processingFee,
      gstOnProcessingFee,
      finalAIP: roundToPrecision(finalAIP, precision),
      rawValues: {
        basePrice: rawBasePrice,
        gstOnBasePrice: rawGstOnBasePrice,
        priceAfterGst: rawPriceAfterGst,
        processingFee: rawProcessingFee,
        gstOnProcessingFee: rawGstOnProcessingFee,
        finalAIP,
      },
    };
  }
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NZD: 'NZ$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}
