// Historical Data Tool Execution
// Main logic for analyzing historical precious metals price data

import { getMetalHistoricalData, parseRelativePeriod, convertToExcelDate, calculateGrowth, formatDateForDisplay } from './utils';

export interface HistoricalDataResult {
  success: boolean;
  data?: {
    metal: string;
    startDate: string;
    endDate: string;
    startDateDisplay: string;
    endDateDisplay: string;
    startPrice: number;
    endPrice: number;
    absoluteChange: number;
    percentageChange: number;
    direction: 'increase' | 'decrease' | 'no change';
    period: string;
    dataPoints?: number;
  };
  error?: string;
}

export async function executeHistoricalDataTool(
  metal: string,
  startDate?: string,
  endDate?: string,
  relativePeriod?: string
): Promise<HistoricalDataResult> {
  try {
    console.log('🔍 Historical Data Tool - Input:', { metal, startDate, endDate, relativePeriod });

    // Validate metal
    if (!['XAU', 'XAG', 'XPT', 'XPD'].includes(metal)) {
      return {
        success: false,
        error: `Invalid metal: ${metal}. Must be XAU, XAG, XPT, or XPD.`
      };
    }

    // Get historical data for the metal
    const historicalData = getMetalHistoricalData(metal as 'XAU' | 'XAG' | 'XPT' | 'XPD');

    if (historicalData.length === 0) {
      return {
        success: false,
        error: `No historical data available for ${metal}`
      };
    }

    let actualStartDate: string;
    let actualEndDate: string;

    // Determine date range
    if (relativePeriod) {
      // Parse relative period (e.g., "last 5 months")
      console.log('📅 Parsing relative period:', relativePeriod);
      const parsed = parseRelativePeriod(relativePeriod);
      actualStartDate = parsed.startDate;
      actualEndDate = parsed.endDate;
      console.log('📅 Parsed dates:', { actualStartDate, actualEndDate });
    } else if (startDate && endDate) {
      // Use provided dates
      actualStartDate = convertToExcelDate(startDate);
      actualEndDate = endDate.toLowerCase() === 'now' ?
        historicalData[historicalData.length - 1].date :
        convertToExcelDate(endDate);
      console.log('📅 Using provided dates:', { actualStartDate, actualEndDate });
    } else {
      return {
        success: false,
        error: 'Either provide specific start/end dates or a relative period like "last 5 months"'
      };
    }

    // Find start and end data points
    const startDataPoint = historicalData.find(point => point.date === actualStartDate);
    const endDataPoint = historicalData.find(point => point.date === actualEndDate);

    // If exact dates not found, find closest available dates
    let closestStart = startDataPoint;
    let closestEnd = endDataPoint;

    if (!closestStart) {
      // Find closest date after the requested start date
      closestStart = historicalData
        .filter(point => point.date >= actualStartDate)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
    }

    if (!closestEnd) {
      // Find closest date before or at the requested end date
      closestEnd = historicalData
        .filter(point => point.date <= actualEndDate)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
    }

    if (!closestStart || !closestEnd) {
      return {
        success: false,
        error: `Could not find data for the requested date range. Available data: ${historicalData[0].displayDate} to ${historicalData[historicalData.length - 1].displayDate}`
      };
    }

    if (closestStart.date === closestEnd.date) {
      return {
        success: false,
        error: `Start and end dates are the same (${closestStart.displayDate}). Please provide a different date range.`
      };
    }

    // Calculate growth
    const growth = calculateGrowth(closestStart.price, closestEnd.price);

    // Calculate period description
    const period = relativePeriod ||
      `from ${closestStart.displayDate} to ${closestEnd.displayDate}`;

    // Count data points in range
    const dataPointsInRange = historicalData.filter(
      point => point.date >= closestStart!.date && point.date <= closestEnd!.date
    ).length;

    return {
      success: true,
      data: {
        metal,
        startDate: closestStart.date,
        endDate: closestEnd.date,
        startDateDisplay: closestStart.displayDate,
        endDateDisplay: closestEnd.displayDate,
        startPrice: closestStart.price,
        endPrice: closestEnd.price,
        absoluteChange: growth.absoluteChange,
        percentageChange: growth.percentageChange,
        direction: growth.direction,
        period,
        dataPoints: dataPointsInRange
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while analyzing historical data'
    };
  }
}