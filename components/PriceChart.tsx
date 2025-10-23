'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataPoint {
  date: string;
  timestamp: number;
  prices: {
    [metal: string]: number;
  };
}

interface ChartData {
  metals: string[];
  currency: string;
  startDate: string;
  endDate: string;
  dataPoints: ChartDataPoint[];
  summary: {
    [metal: string]: {
      min: number;
      max: number;
      avg: number;
      change: number;
      changePercent: number;
    };
  };
}

interface PriceChartProps {
  data: ChartData;
}

// Metal colors for chart lines
const METAL_COLORS: { [key: string]: { border: string; background: string } } = {
  XAU: { border: 'rgb(255, 193, 7)', background: 'rgba(255, 193, 7, 0.1)' },  // Gold
  XAG: { border: 'rgb(192, 192, 192)', background: 'rgba(192, 192, 192, 0.1)' },  // Silver
  XPT: { border: 'rgb(229, 228, 226)', background: 'rgba(229, 228, 226, 0.1)' },  // Platinum
  XPD: { border: 'rgb(205, 127, 50)', background: 'rgba(205, 127, 50, 0.1)' }  // Palladium
};

// Metal display names
const METAL_NAMES: { [key: string]: string } = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium'
};

export default function PriceChart({ data }: PriceChartProps) {
  const { metals, currency, dataPoints, summary } = data;

  // Prepare chart data
  const labels = dataPoints.map(point => point.date);

  const datasets = metals.map(metal => ({
    label: `${METAL_NAMES[metal]} (${metal})`,
    data: dataPoints.map(point => point.prices[metal]),
    borderColor: METAL_COLORS[metal]?.border || 'rgb(75, 192, 192)',
    backgroundColor: METAL_COLORS[metal]?.background || 'rgba(75, 192, 192, 0.1)',
    tension: 0.4,
    fill: metals.length === 1, // Only fill if single metal
    pointRadius: 4,
    pointHoverRadius: 6
  }));

  const chartData = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Precious Metals Price Trend (${currency})`,
        color: 'rgb(243, 244, 246)',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="my-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <Line data={chartData} options={options} />

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metals.map(metal => {
          const stats = summary[metal];
          if (!stats) return null;

          return (
            <div key={metal} className="p-3 bg-gray-900/50 rounded border border-gray-700">
              <div className="text-sm font-semibold text-gray-300 mb-2">{METAL_NAMES[metal]}</div>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className={stats.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {stats.change >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span>${stats.min.toFixed(2)} - ${stats.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span>${stats.avg.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
