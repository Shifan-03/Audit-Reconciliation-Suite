import { CurrencyCode } from '../types';
import { FX_RATES, CURRENCY_SYMBOLS } from '../data/mockData';

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  compact: boolean = false
): string {
  // Convert from USD base
  const rate = FX_RATES[currency] || 1.0;
  const converted = amount * rate;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  if (currency === 'BDT' && compact) {
    if (Math.abs(converted) >= 10_000_000) {
      return `${symbol}${(converted / 10_000_000).toFixed(2)} Cr`;
    }
    if (Math.abs(converted) >= 100_000) {
      return `${symbol}${(converted / 100_000).toFixed(2)} Lk`;
    }
  }

  if (compact && Math.abs(converted) >= 1_000_000) {
    return `${symbol}${(converted / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(converted) >= 1_000) {
    return `${symbol}${(converted / 1_000).toFixed(1)}k`;
  }

  const isNegative = converted < 0;
  const absFormatted = Math.abs(converted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `(${symbol}${absFormatted})` : `${symbol}${absFormatted}`;
}

export function formatVariancePct(pct: number): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (pct === 0) return { text: '0.00%', isPositive: false, isNeutral: true };
  const sign = pct > 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(2)}%`,
    isPositive: pct > 0,
    isNeutral: false,
  };
}

export function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${hex}${hex}${hex}`.substring(0, 34);
}
