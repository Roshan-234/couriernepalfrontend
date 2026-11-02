import api from "./api";
import type { TrackingData } from "@/components/tracking/TrackingResult";
export interface Shipment extends TrackingData {
  id: number;
  sender_name: string;
  sender_address: string;
  sender_phone: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  total_weight_kg: number;
  total_packages: number;
  notes: string;
}
export interface ShipmentPage { items: Shipment[]; total: number; page: number; pages: number; summary: { total: number; in_transit: number; delivered: number; pending: number }; }
export async function getShipments(admin = false, page = 1, search = '', perPage = 20): Promise<ShipmentPage> {
 return (await api.get('/shipments/page', { params: { all: admin ? 1 : 0, page, search, per_page: perPage } })).data;
}
