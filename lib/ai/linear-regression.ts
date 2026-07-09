import { LinearRegressionResult, PredictionResult, DailyForecast } from "@/types";
import { format, addDays, parseISO } from "date-fns";
import {
  getCurrentDayOfMonth,
  getDaysInCurrentMonth,
  getTodayISO,
} from "@/lib/utils/date";
import { calculateBill } from "@/lib/utils/bill";

/**
 * Perform Ordinary Least Squares Linear Regression
 * y = slope * x + intercept
 * where x = day index (1, 2, 3...), y = units consumed
 */
export function linearRegression(data: number[]): LinearRegressionResult {
  const n = data.length;
  if (n < 2) {
    return { slope: 0, intercept: data[0] ?? 0, r_squared: 0 };
  }

  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = data;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const meanY = sumY / n;
  const ssTot = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
  const ssRes = y.reduce(
    (acc, yi, i) => acc + Math.pow(yi - (slope * x[i] + intercept), 2),
    0
  );
  const r_squared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return {
    slope: parseFloat(slope.toFixed(6)),
    intercept: parseFloat(intercept.toFixed(6)),
    r_squared: parseFloat(Math.max(0, Math.min(1, r_squared)).toFixed(4)),
  };
}

/**
 * Predict remaining units for the month using linear regression
 */
export function predictMonthEnd(
  dailyUnits: number[],
  tariffPerUnit: number,
  startDateStr: string
): PredictionResult {
  const regression = linearRegression(dailyUnits);
  const { slope, intercept, r_squared } = regression;

  const currentDay = getCurrentDayOfMonth();
  const totalDays = getDaysInCurrentMonth();
  const remainingDays = totalDays - currentDay;

  // Actual data points
  const actualForecasts: DailyForecast[] = dailyUnits.map((units, i) => {
    const date = format(
      addDays(parseISO(startDateStr), i),
      "yyyy-MM-dd"
    );
    return { date, predicted_units: units, is_actual: true };
  });

  // Predicted data points for remaining days
  const predictedForecasts: DailyForecast[] = [];
  let predictedTotalUnits = dailyUnits.reduce((a, b) => a + b, 0);

  for (let i = 1; i <= remainingDays; i++) {
    const dayIndex = dailyUnits.length + i;
    const predicted = Math.max(0, slope * dayIndex + intercept);
    predictedTotalUnits += predicted;

    const date = format(
      addDays(parseISO(getTodayISO()), i),
      "yyyy-MM-dd"
    );
    predictedForecasts.push({
      date,
      predicted_units: parseFloat(predicted.toFixed(3)),
      is_actual: false,
    });
  }

  const predicted_units = parseFloat(predictedTotalUnits.toFixed(2));
  const predicted_bill = calculateBill(predicted_units, tariffPerUnit);

  // Confidence: based on R² and number of data points
  const dataConfidence = Math.min(1, dailyUnits.length / 15); // max at 15 days
  const confidence = Math.round(
    (r_squared * 0.6 + dataConfidence * 0.4) * 100
  );

  return {
    predicted_units,
    predicted_bill,
    predictedUnits: predicted_units,
    predictedBill: predicted_bill,
    slope: regression.slope,
    intercept: regression.intercept,
    confidence: Math.max(10, Math.min(99, confidence)),
    daily_forecast: [...actualForecasts, ...predictedForecasts],
    regression,
  };
}

/**
 * Smooth a series using a simple moving average
 */
export function movingAverage(data: number[], window = 3): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}
