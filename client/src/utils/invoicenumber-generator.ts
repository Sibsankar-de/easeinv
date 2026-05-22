interface InvoiceNumberOptions {
  prefix: string;
  lastInvoiceNumber?: string; // e.g. INV-202501-009
  date?: Date;
}

export function getNextInvoiceNumber({
  prefix,
  lastInvoiceNumber,
  date = new Date(),
}: InvoiceNumberOptions): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const currentYYYYMM = `${year}${month}`;

  let nextSequence = 1;

  if (lastInvoiceNumber) {
    const regex = new RegExp(`^${prefix}-(\\d{6})-(\\d{3})$`);
    const match = lastInvoiceNumber.match(regex);

    if (match) {
      const [, lastYYYYMM, lastSeq] = match;

      if (lastYYYYMM === currentYYYYMM) {
        nextSequence = Number(lastSeq) + 1;
      }
    }
  }

  const sequence = String(nextSequence).padStart(3, "0");
  return `${prefix}-${currentYYYYMM}-${sequence}`;
}
