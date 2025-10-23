// Historical Data Utilities
// Date parsing, JSON reading, and data processing utilities

import fs from 'fs';
import path from 'path';

// Metal name mapping (API symbols to JSON keys)
const METAL_NAMES = {
  'XAU': 'Gold',
  'XAG': 'Silver',
  'XPT': 'Platinum',
  'XPD': 'Palladium'
} as const;

// Convert Excel date format (1990M1) to readable format
export function formatDateForDisplay(excelDate: string): string {
  const match = excelDate.match(/^(\d{4})M(\d{1,2})$/);
  if (!match) return excelDate;

  const year = match[1];
  const month = parseInt(match[2]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${monthNames[month - 1]} ${year}`;
}

// Convert readable date (YYYY-MM) to Excel format (YYYYMM)
export function convertToExcelDate(dateStr: string): string {
  // Handle formats like "1990-01", "1990-1", "1990-Jan", etc.
  const yearMonthMatch = dateStr.match(/^(\d{4})-(\d{1,2})$/);
  if (yearMonthMatch) {
    const year = yearMonthMatch[1];
    const month = parseInt(yearMonthMatch[2]);
    return `${year}M${month}`;
  }

  // If already in Excel format, return as-is
  if (dateStr.match(/^\d{4}M\d{1,2}$/)) {
    return dateStr;
  }

  throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM format.`);
}

// Parse relative time periods like "5 months ago", "last year"
export function parseRelativePeriod(relativePeriod: string, currentDate?: Date): { startDate: string, endDate: string } {
  // Use the latest date in our dataset instead of current date
  // Our data goes to 2025M9, so use that as the "current" date
  const latestDataYear = 2025;
  const latestDataMonth = 9;

  const endDateExcel = `${latestDataYear}M${latestDataMonth}`;

  // Parse patterns like "10 weeks", "last 10 weeks", "past 8 weeks"
  // Convert weeks to months (approximately 4.33 weeks per month)
  const weeksMatch = relativePeriod.match(/(?:last|past|)\s*(\d+)\s*weeks?/i);
  if (weeksMatch) {
    const weeksBack = parseInt(weeksMatch[1]);
    const monthsBack = Math.round(weeksBack / 4.33);
    let startYear = latestDataYear;
    let startMonth = latestDataMonth - monthsBack;

    // Handle month overflow
    while (startMonth <= 0) {
      startMonth += 12;
      startYear -= 1;
    }

    return {
      startDate: `${startYear}M${startMonth}`,
      endDate: endDateExcel
    };
  }

  // Parse patterns like "5 months", "last 5 months", "past 6 months"
  const monthsMatch = relativePeriod.match(/(?:last|past|)\s*(\d+)\s*months?/i);
  if (monthsMatch) {
    const monthsBack = parseInt(monthsMatch[1]);
    let startYear = latestDataYear;
    let startMonth = latestDataMonth - monthsBack;

    // Handle month overflow
    while (startMonth <= 0) {
      startMonth += 12;
      startYear -= 1;
    }

    return {
      startDate: `${startYear}M${startMonth}`,
      endDate: endDateExcel
    };
  }

  // Parse patterns like "1 year", "last year", "past year"
  const yearMatch = relativePeriod.match(/(?:last|past|)\s*(\d+)?\s*years?/i);
  if (yearMatch) {
    const yearsBack = yearMatch[1] ? parseInt(yearMatch[1]) : 1;
    const startYear = latestDataYear - yearsBack;

    return {
      startDate: `${startYear}M${latestDataMonth}`,
      endDate: endDateExcel
    };
  }

  throw new Error(`Unable to parse relative period: ${relativePeriod}`);
}

// Data interfaces
export interface HistoricalDataPoint {
  date: string;
  displayDate: string;
  price: number;
}

interface PreciousMetalsData {
  [metalName: string]: Array<{
    date: string;  // MM/YYYY format in JSON
    price: number;
  }>;
}

// Convert JSON date format (MM/YYYY) to internal format (YYYYMM)
function convertJsonDateToInternal(jsonDate: string): string {
  const match = jsonDate.match(/^(\d{2})\/(\d{4})$/);
  if (!match) {
    throw new Error(`Invalid date format in JSON: ${jsonDate}`);
  }
  const month = parseInt(match[1]);
  const year = match[2];
  return `${year}M${month}`;
}

// Get historical data for specific metal from JSON file
export function getMetalHistoricalData(metal: keyof typeof METAL_NAMES): HistoricalDataPoint[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'precious_metals.json');
    console.log('📂 Attempting to read file:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData: PreciousMetalsData = JSON.parse(fileContent);

    // Get the metal name from the mapping
    const metalName = METAL_NAMES[metal];

    if (!jsonData[metalName]) {
      throw new Error(`Metal ${metalName} not found in JSON data`);
    }

    // Convert JSON data to internal format
    const data: HistoricalDataPoint[] = jsonData[metalName].map(entry => {
      const internalDate = convertJsonDateToInternal(entry.date);
      return {
        date: internalDate,
        displayDate: formatDateForDisplay(internalDate),
        price: entry.price
      };
    });

    return data.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    throw new Error(`Failed to get historical data for ${metal}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Calculate percentage change
export function calculateGrowth(startPrice: number, endPrice: number): {
  absoluteChange: number;
  percentageChange: number;
  direction: 'increase' | 'decrease' | 'no change';
} {
  const absoluteChange = endPrice - startPrice;
  const percentageChange = (absoluteChange / startPrice) * 100;

  let direction: 'increase' | 'decrease' | 'no change';
  if (absoluteChange > 0) direction = 'increase';
  else if (absoluteChange < 0) direction = 'decrease';
  else direction = 'no change';

  return {
    absoluteChange,
    percentageChange,
    direction
  };
}