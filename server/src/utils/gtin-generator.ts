type GTINLength = 8 | 12 | 13 | 14;

/**
 * Generate a valid GTIN code (GTIN-8, 12, 13, or 14)
 */
export function generateGTIN(length: GTINLength = 13): string {
  if (![8, 12, 13, 14].includes(length)) {
    throw new Error("Invalid GTIN length");
  }

  // Generate base digits (without check digit)
  const baseLength = length - 1;
  let base = "";

  for (let i = 0; i < baseLength; i++) {
    base += Math.floor(Math.random() * 10);
  }

  const checkDigit = calculateGTINCheckDigit(base);
  return base + checkDigit;
}

/**
 * Calculate GS1 GTIN check digit
 */
function calculateGTINCheckDigit(base: string): number {
  const digits = base.split("").map(Number).reverse();

  const sum = digits.reduce((acc, digit, index) => {
    const multiplier = index % 2 === 0 ? 3 : 1;
    return acc + digit * multiplier;
  }, 0);

  return (10 - (sum % 10)) % 10;
}
