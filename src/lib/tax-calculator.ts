export interface GstBreakdown {
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  grossAmount: number;
}

/**
 * Calculates GST breakdown for MRP / Inclusive Selling Price (Standard Indian Retail).
 * Formula: Taxable Amount = Gross Amount / (1 + GST_Rate / 100)
 */
export function calculateGstInclusive(
  grossAmount: number,
  gstRate: number = 18,
  isInterstate: boolean = false
): GstBreakdown {
  const rateFraction = gstRate / 100;
  const taxableAmount = grossAmount / (1 + rateFraction);
  const totalTax = grossAmount - taxableAmount;

  if (isInterstate) {
    return {
      taxableAmount: roundToTwo(taxableAmount),
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: roundToTwo(totalTax),
      totalTax: roundToTwo(totalTax),
      grossAmount: roundToTwo(grossAmount),
    };
  }

  const halfRate = gstRate / 2;
  const halfTax = totalTax / 2;

  return {
    taxableAmount: roundToTwo(taxableAmount),
    cgstRate: halfRate,
    cgstAmount: roundToTwo(halfTax),
    sgstRate: halfRate,
    sgstAmount: roundToTwo(halfTax),
    igstRate: 0,
    igstAmount: 0,
    totalTax: roundToTwo(totalTax),
    grossAmount: roundToTwo(grossAmount),
  };
}

/**
 * Calculates GST breakdown when price is exclusive of taxes.
 */
export function calculateGstExclusive(
  taxableAmount: number,
  gstRate: number = 18,
  isInterstate: boolean = false
): GstBreakdown {
  const totalTax = taxableAmount * (gstRate / 100);
  const grossAmount = taxableAmount + totalTax;

  if (isInterstate) {
    return {
      taxableAmount: roundToTwo(taxableAmount),
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: roundToTwo(totalTax),
      totalTax: roundToTwo(totalTax),
      grossAmount: roundToTwo(grossAmount),
    };
  }

  const halfRate = gstRate / 2;
  const halfTax = totalTax / 2;

  return {
    taxableAmount: roundToTwo(taxableAmount),
    cgstRate: halfRate,
    cgstAmount: roundToTwo(halfTax),
    sgstRate: halfRate,
    sgstAmount: roundToTwo(halfTax),
    igstRate: 0,
    igstAmount: 0,
    totalTax: roundToTwo(totalTax),
    grossAmount: roundToTwo(grossAmount),
  };
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

