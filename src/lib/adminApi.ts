import { API_BASE_URL } from '@/config';

interface DashboardStats {
  totalShipments: number;
  shipmentChange: number;
  revenue: number;
  revenueChange: number;
  activeCustomers: number;
  customerChange: number;
  avgDeliveryTime: number;
  deliveryTimeChange: number;
}

interface ShipmentTrends {
  labels: string[];
  domestic: number[];
  international: number[];
}

interface RevenueAnalytics {
  labels: string[];
  revenue: number[];
  expenses: number[];
  profit: number[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return response.json();
}

export async function getShipmentTrends(): Promise<ShipmentTrends> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/shipment-trends`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipment trends');
  }

  return response.json();
}

export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/revenue-analytics`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch revenue analytics');
  }

  return response.json();
}
