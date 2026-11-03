"use client";

/**
 * The canvas half of the monthly revenue figure.
 *
 * Revenue only. `/admin/dashboard/revenue-analytics` returns `expenses` and
 * `profit` as arrays of `null` because no expense ledger exists behind this
 * API — plotting either would draw a margin the business has no data for, so
 * neither series is passed in or accepted here.
 *
 * Dynamically imported with `ssr: false`; the accessible version of this
 * data is the caption and table the panel renders beside it.
 */

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatCurrency } from "@/lib/utils";
import { BRAND_NAVY, CHART_GRID, CHART_TEXT, shortMonth } from "./chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface RevenueCanvasProps {
  /** Month names, oldest first. */
  labels: string[];
  revenue: number[];
}

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (item) => formatCurrency(Number(item.parsed.y ?? 0)),
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: CHART_TEXT } },
    y: {
      beginAtZero: true,
      grid: { color: CHART_GRID },
      ticks: { color: CHART_TEXT },
    },
  },
};

export default function RevenueCanvas({ labels, revenue }: RevenueCanvasProps) {
  const data: ChartData<"bar"> = {
    labels: labels.map(shortMonth),
    datasets: [
      {
        label: "Revenue",
        data: revenue,
        backgroundColor: BRAND_NAVY,
        borderRadius: 4,
        maxBarThickness: 36,
      },
    ],
  };

  return (
    <div className="h-64" aria-hidden="true">
      <Bar data={data} options={options} />
    </div>
  );
}
