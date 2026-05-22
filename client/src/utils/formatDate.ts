export function formatDateStr(mongoDateStr: string | Date | number) {
  /**
   * Convert a MongoDB ISO date string into separate formatted date and time strings.
   *
   * @param mongoDateStr - A string representing a date in MongoDB ISO format (e.g., "2004-08-01T00:45:00Z")
   * @returns An object with two properties:
   *          dateStr (e.g., "1 aug 2004") and timeStr (e.g., "12:45 AM")
   */
  const date = new Date(mongoDateStr);

  // Format date as "1 aug 2004"
  const day = date.getDate();
  const monthNames = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const monthNumber = date.getMonth() + 1;
  const month = monthNames[monthNumber - 1];
  const year = date.getFullYear();
  const dateStr = `${day} ${month} ${year}`;

  // Format time as "12:45 AM"
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours || 12; // Convert 0 to 12
  const timeStr = `${hours}:${minutes} ${ampm}`;
  const dashedDate = `${year}-${monthNumber.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;

  return {
    dashedDate,
    dateStr,
    timeStr,
    day,
    monthNumber,
    year,
    month,
  };
}

export function getDayDifference(date1: string | Date, date2: string | Date) {
  // Convert strings to Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Validate that both are valid dates
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return;
  }

  // Calculate difference in milliseconds
  const diffInMs = Math.abs(d2.getTime() - d1.getTime());

  // Convert milliseconds to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.floor(diffInDays);
}

export function resetTime(dateInput: Date | string): Date {
  // Convert input to a Date object
  const date = new Date(dateInput);

  // Validate that it’s a valid date
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided.");
  }

  // Create a new date with time reset to 00:00:00.000
  const resetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return resetDate;
}

export function addDays(dateStr: string, days: number = 1) {
  const date = new Date(dateStr);

  // Validate input
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string provided");
  }

  // Add one day
  date.setDate(date.getDate() + days);

  // Reset time to midnight (local time)
  date.setHours(0, 0, 0, 0);

  // Return as ISO string (UTC time)
  return date.toISOString();
}
