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
export async function getShipments(admin = false): Promise<Shipment[]> {
  return (await api.get(admin ? "/shipments" : "/shipments/my")).data;
}
