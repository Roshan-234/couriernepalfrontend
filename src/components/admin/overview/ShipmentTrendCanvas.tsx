"use client";

/**
 * The canvas half of the shipment-trend figure.
 *
 * This module is the only place Chart.js is imported on the overview screen,
 * and it is pulled in with `next/dynamic({ ssr: false })` so the library
 * stays out of the first load. The canvas itself is `aria-hidden`: the
 * accessible version of this data is the caption and table the panel renders
 * beside it.
 */

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { BRAND_NAVY, BRAND_TEAL, CHART_GRID, CHART_TEXT, shortDay } from "./chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export interface ShipmentTrendCanvasProps {
  /** ISO dates, oldest first. */
  labels: string[];
  domestic: number[];
  international: number[];
}

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { position: "top", labels: { color: CHART_TEXT, boxWidth: 12, usePointStyle: true } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: CHART_TEXT, maxTicksLimit: 10 } },
    y: {
      beginAtZero: true,
      grid: { color: CHART_GRID },
      ticks: { color: CHART_TEXT, precision: 0 },
    },
  },
};

export default function ShipmentTrendCanvas({
  labels,
  domestic,
  international,
}: ShipmentTrendCanvasProps) {
  const data: ChartData<"line"> = {
    labels: labels.map(shortDay),
    datasets: [
      {
        label: "Domestic",
        data: domestic,
        borderColor: BRAND_TEAL,
        backgroundColor: "rgba(17, 123, 142, 0.14)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: "International",
        data: international,
        borderColor: BRAND_NAVY,
        backgroundColor: "rgba(56, 55, 114, 0.12)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  return (
    <div className="h-64" aria-hidden="true">
      <Line data={data} options={options} />
    </div>
  );
}
