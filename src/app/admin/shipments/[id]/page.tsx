import ShipmentDetail from "@/components/admin/operations/ShipmentDetail";

/**
 * Next 15 hands route params in as a promise. React 18 has no `use()`, so
 * this stays a server component whose only job is to await them and pass the
 * id down to the client view.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShipmentDetail shipmentId={id} />;
}
