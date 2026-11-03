"use client";

/**
 * The operations view of a single shipment.
 *
 * Admins used to fall through to the customer-facing page, which shows the
 * timeline but none of the levers. This view keeps the timeline and adds the
 * things an operator needs in the same place: the charge breakdown, the
 * delivery attempts with their reason codes, the status control, and the
 * last-mile actions.
 */

import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Breadcrumbs,
  Skeleton,
  StatusBadge,
} from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { deliveries, shipments } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { Shipment } from "@/types/logistics";
import { DeliveryActionsCard } from "./DeliveryActionsCard";
import { DescriptionList, LoadError, PageHeader, type DetailItem } from "./Layout";
import { ShipmentStatusCard } from "./ShipmentStatusCard";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { EMPTY, count, dateTime, money, text, titleCase, weight } from "./format";

export interface ShipmentDetailProps {
  /** Route segment. The API accepts the numeric id. */
  shipmentId: string;
}

function dimensions(shipment: Shipment): string {
  const { length_cm, width_cm, height_cm } = shipment;
  if (length_cm === null || width_cm === null || height_cm === null) return EMPTY;
  return `${length_cm} × ${width_cm} × ${height_cm} cm`;
}

function ChargeRow({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-4 py-2 " +
        (total ? "border-t border-slate-300 pt-3 font-bold" : "")
      }
    >
      <dt className={total ? "text-sm text-[color:var(--brand-navy)]" : "text-sm text-slate-600"}>
        {label}
      </dt>
      <dd
        className={
          "tabular-nums " +
          (total ? "text-base text-[color:var(--brand-navy)]" : "text-sm text-slate-800")
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function ShipmentDetail({ shipmentId }: ShipmentDetailProps) {
  const numericId = Number(shipmentId);

  const detail = useQuery({
    queryKey: queryKeys.shipments.detail(shipmentId),
    queryFn: () => shipments.get(shipmentId),
  });

  const attempts = useQuery({
    queryKey: queryKeys.shipments.attempts(shipmentId),
    queryFn: () => deliveries.attempts(numericId),
    enabled: Number.isFinite(numericId),
  });

  const crumbs = (
    <Breadcrumbs
      items={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Shipments", href: "/admin/shipments" },
        { label: detail.data?.tracking_no ?? "Shipment" },
      ]}
    />
  );

  if (detail.isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        {crumbs}
        <Skeleton height="2.25rem" width="18rem" />
        <Skeleton variant="rect" height="9rem" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton variant="rect" height="26rem" className="lg:col-span-2" />
          <Skeleton variant="rect" height="26rem" />
        </div>
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <>
        {crumbs}
        <PageHeader title="Shipment" />
        <LoadError
          message={errorMessage(detail.error, "That shipment could not be loaded.")}
          onRetry={() => void detail.refetch()}
        />
      </>
    );
  }

  const shipment = detail.data;

  const headline: DetailItem[] = [
    {
      label: "Route",
      value: `${text(shipment.origin_district ?? shipment.origin)} → ${text(
        shipment.destination_district ?? shipment.destination,
      )}`,
    },
    { label: "Service level", value: titleCase(shipment.service_level) },
    { label: "Booked", value: dateTime(shipment.created_at) },
    { label: "SLA due", value: dateTime(shipment.sla_due_at) },
    { label: "Estimated delivery", value: dateTime(shipment.estimated_delivery) },
    { label: "Delivered", value: dateTime(shipment.delivered_at) },
  ];

  const sender: DetailItem[] = [
    { label: "Name", value: text(shipment.sender_name) },
    { label: "Phone", value: text(shipment.sender_phone) },
    { label: "Email", value: text(shipment.sender_email) },
    { label: "Address", value: text(shipment.sender_address), wide: true },
    { label: "District", value: text(shipment.origin_district) },
    { label: "Branch", value: text(shipment.origin_branch?.name) },
  ];

  const receiver: DetailItem[] = [
    { label: "Name", value: text(shipment.receiver_name) },
    { label: "Phone", value: text(shipment.receiver_phone) },
    { label: "Email", value: text(shipment.receiver_email) },
    { label: "Address", value: text(shipment.receiver_address), wide: true },
    { label: "District", value: text(shipment.destination_district) },
    { label: "Branch", value: text(shipment.destination_branch?.name) },
  ];

  const cargo: DetailItem[] = [
    { label: "Packages", value: count(shipment.total_packages) },
    { label: "Actual weight", value: weight(shipment.total_weight_kg) },
    { label: "Volumetric weight", value: weight(shipment.volumetric_weight_kg) },
    { label: "Chargeable weight", value: weight(shipment.chargeable_weight_kg) },
    { label: "Dimensions", value: dimensions(shipment) },
    { label: "Declared value", value: money(shipment.declared_value, shipment.currency) },
    { label: "Contents", value: text(shipment.contents_description), wide: true },
    {
      label: "Handling",
      value: (
        <span className="flex flex-wrap gap-2">
          {shipment.is_fragile && <Badge tone="amber" size="sm">Fragile</Badge>}
          {shipment.is_insured && (
            <Badge tone="teal" size="sm">
              Insured {money(shipment.insurance_amount, shipment.currency)}
            </Badge>
          )}
          {!shipment.is_fragile && !shipment.is_insured && (
            <span className="text-slate-600">Standard handling</span>
          )}
        </span>
      ),
      wide: true,
    },
  ];

  const parcels = shipment.parcels ?? [];
  const attemptRows = attempts.data ?? shipment.attempts ?? [];

  return (
    <>
      <PageHeader
        above={crumbs}
        title={shipment.tracking_no}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={shipment.status}
              label={shipment.status_label}
              group={shipment.status_group}
            />
            {shipment.is_cod && (
              <Badge tone="yellow" size="sm">
                COD {money(shipment.cod_amount, shipment.cod_currency)}
              </Badge>
            )}
            {shipment.reference_no && (
              <Badge tone="neutral" size="sm">
                Ref {shipment.reference_no}
              </Badge>
            )}
          </span>
        }
      />

      <section aria-label="Shipment summary" className="panel mb-6">
        <DescriptionList items={headline} columns={3} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="sender-panel" className="panel">
              <h2
                id="sender-panel"
                className="mb-4 text-base font-bold text-[color:var(--brand-navy)]"
              >
                Sender
              </h2>
              <DescriptionList items={sender} columns={1} />
            </section>

            <section aria-labelledby="receiver-panel" className="panel">
              <h2
                id="receiver-panel"
                className="mb-4 text-base font-bold text-[color:var(--brand-navy)]"
              >
                Receiver
              </h2>
              <DescriptionList items={receiver} columns={1} />
            </section>
          </div>

          <section aria-labelledby="cargo-panel" className="panel">
            <h2
              id="cargo-panel"
              className="mb-4 text-base font-bold text-[color:var(--brand-navy)]"
            >
              Parcels and weight
            </h2>
            <DescriptionList items={cargo} columns={3} />

            <h3 className="mt-6 mb-2 text-sm font-bold text-[color:var(--brand-navy)]">
              Individual parcels
            </h3>
            {parcels.length === 0 ? (
              <p className="text-sm text-slate-600">
                No parcel lines were recorded against this shipment.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {parcels.map((parcel, index) => (
                  <li
                    key={parcel.id ?? index}
                    className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                  >
                    <span className="min-w-0 truncate text-slate-800">
                      {text(parcel.description) === EMPTY
                        ? `Parcel ${index + 1}`
                        : parcel.description}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-700">
                      {weight(parcel.weight_kg)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="charges-panel" className="panel">
            <h2
              id="charges-panel"
              className="mb-2 text-base font-bold text-[color:var(--brand-navy)]"
            >
              Charges
            </h2>
            <dl>
              <ChargeRow
                label="Freight"
                value={money(shipment.freight_charge, shipment.currency)}
              />
              <ChargeRow
                label="Surcharges"
                value={money(shipment.surcharge_total, shipment.currency)}
              />
              <ChargeRow label="Tax" value={money(shipment.tax_amount, shipment.currency)} />
              <ChargeRow
                label="Total"
                value={money(shipment.total_charge, shipment.currency)}
                total
              />
            </dl>
            <DescriptionList
              className="mt-4 border-t border-slate-200 pt-4"
              columns={3}
              items={[
                { label: "Payment mode", value: titleCase(shipment.payment_mode) },
                { label: "Payment status", value: titleCase(shipment.payment_status) },
                {
                  label: "COD",
                  value: shipment.is_cod
                    ? `${money(shipment.cod_amount, shipment.cod_currency)} · ${titleCase(
                        shipment.cod_status,
                      )}`
                    : "Not a COD shipment",
                },
              ]}
            />
          </section>

          <section aria-labelledby="timeline-panel" className="panel">
            <h2 id="timeline-panel" className="sr-only">
              Tracking history
            </h2>
            <ShipmentTimeline
              events={shipment.events ?? []}
              attempts={attemptRows}
              attemptsLoading={attempts.isLoading}
            />
            {attempts.isError && (
              <p role="alert" className="mt-3 text-sm text-red-800">
                The attempts list could not be loaded: {errorMessage(attempts.error)}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <ShipmentStatusCard shipment={shipment} />

          <section aria-labelledby="rider-panel" className="panel space-y-3">
            <h2
              id="rider-panel"
              className="text-base font-bold text-[color:var(--brand-navy)]"
            >
              Assigned rider
            </h2>
            {shipment.rider ? (
              <DescriptionList
                columns={1}
                items={[
                  { label: "Name", value: shipment.rider.name },
                  { label: "Rider code", value: shipment.rider.rider_code },
                  { label: "Phone", value: text(shipment.rider.phone) },
                  { label: "Duty status", value: titleCase(shipment.rider.status) },
                  { label: "Vehicle", value: titleCase(shipment.rider.vehicle_type) },
                ]}
              />
            ) : (
              <p className="text-sm text-slate-700">
                {shipment.rider_id
                  ? `Rider #${shipment.rider_id} is on this shipment, but the API did not return their profile.`
                  : "No rider is assigned to this shipment."}
              </p>
            )}
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">Reassignment is not available yet.</span> There is
              no endpoint for changing a shipment&apos;s rider, so this panel is read-only. Until
              one exists, move the work through the pickup or the delivery attempt instead.
            </p>
          </section>

          <DeliveryActionsCard shipment={shipment} />

          {shipment.notes && (
            <section aria-labelledby="notes-panel" className="panel">
              <h2
                id="notes-panel"
                className="mb-2 text-base font-bold text-[color:var(--brand-navy)]"
              >
                Internal notes
              </h2>
              <p className="whitespace-pre-line text-sm text-slate-800">{shipment.notes}</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export default ShipmentDetail;
