"use client";

/**
 * The tariff: rate cards, the lanes on them, and the surcharges that ride on
 * top — plus a tester that runs the live engine so staff can check a price
 * before quoting it to a customer.
 *
 * Three things the UI has to keep honest. Lane precedence is most-specific
 * first (district pair → zone pair → destination country) and is stated on
 * the Entries tab rather than left to be discovered. A surcharge cannot be
 * deleted, only deactivated. And every figure shown is the server's.
 */

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Field,
  Modal,
  Pagination,
  Select,
  Tabs,
  type DataTableColumn,
  type SelectOption,
  useToast,
} from "@/components/kit";
import { Money, formatPercent, formatWeight } from "@/components/admin/finance/money";
import {
  ActiveBadge,
  FinanceHeader,
  InfoNotice,
  QueryError,
  formatDay,
  titleCase,
} from "@/components/admin/finance/shared";
import { RateCardForm, type RateCardPayload } from "@/components/admin/finance/RateCardForm";
import { RateEntryForm, type RateEntryPayload } from "@/components/admin/finance/RateEntryForm";
import { SurchargeForm, type SurchargePayload } from "@/components/admin/finance/SurchargeForm";
import { QuoteTester } from "@/components/admin/finance/QuoteTester";
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { rates } from "@/lib/resources/finance";
import { geo } from "@/lib/resources/operations";
import type { RateCard, RateCardEntry, Surcharge } from "@/types/logistics";

const PER_PAGE = 20;

/** How a lane reads in one line, whichever way it is keyed. */
function laneLabel(entry: RateCardEntry): string {
  if (entry.origin_district || entry.destination_district) {
    return `${entry.origin_district ?? "any"} → ${entry.destination_district ?? "any"}`;
  }
  if (entry.destination_country) return `Any → ${entry.destination_country}`;
  if (entry.origin_zone || entry.destination_zone) {
    return `${entry.origin_zone ? titleCase(entry.origin_zone) : "any"} → ${
      entry.destination_zone ? titleCase(entry.destination_zone) : "any"
    }`;
  }
  return "Unkeyed lane";
}

function laneSpecificity(entry: RateCardEntry): { label: string; tone: "navy" | "teal" | "neutral" } {
  if (entry.origin_district || entry.destination_district) return { label: "District", tone: "navy" };
  if (entry.origin_zone || entry.destination_zone) return { label: "Zone", tone: "teal" };
  return { label: "Country", tone: "neutral" };
}

export default function RatesPage() {
  const toast = useToast();
  const cache = useQueryClient();

  const [tab, setTab] = useState("cards");
  const [cardPage, setCardPage] = useState(1);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const [cardModal, setCardModal] = useState<{ open: boolean; card: RateCard | null }>({
    open: false,
    card: null,
  });
  const [deactivateCard, setDeactivateCard] = useState<RateCard | null>(null);

  const [entryModal, setEntryModal] = useState<{ open: boolean; entry: RateCardEntry | null }>({
    open: false,
    entry: null,
  });
  const [removeEntry, setRemoveEntry] = useState<RateCardEntry | null>(null);

  const [surchargeModal, setSurchargeModal] = useState<{ open: boolean; surcharge: Surcharge | null }>({
    open: false,
    surcharge: null,
  });
  const [retireSurcharge, setRetireSurcharge] = useState<Surcharge | null>(null);

  const cardsQuery = useQuery({
    queryKey: queryKeys.rates.cards({ page: cardPage, per_page: PER_PAGE }),
    queryFn: () => rates.cards({ page: cardPage, per_page: PER_PAGE }),
    placeholderData: keepPreviousData,
  });

  const districtsQuery = useQuery({
    queryKey: queryKeys.geo.districts({}),
    queryFn: () => geo.districts(),
    staleTime: 60 * 60 * 1000,
  });

  const cardQuery = useQuery({
    queryKey: queryKeys.rates.card(selectedCardId ?? 0),
    queryFn: () => rates.card(selectedCardId as number),
    enabled: selectedCardId !== null,
  });

  const surchargesQuery = useQuery({
    queryKey: queryKeys.rates.surcharges,
    queryFn: () => rates.surcharges(),
  });

  const cards = useMemo(() => cardsQuery.data?.items ?? [], [cardsQuery.data]);

  // Land on a card so the Entries tab is never a dead end.
  useEffect(() => {
    if (selectedCardId === null && cards.length > 0) setSelectedCardId(cards[0].id);
  }, [cards, selectedCardId]);

  const refreshCards = async (cardId?: number) => {
    await cache.invalidateQueries({ queryKey: queryKeys.rates.all });
    if (cardId !== undefined) await cache.invalidateQueries({ queryKey: queryKeys.rates.card(cardId) });
  };

  const saveCardMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: RateCardPayload }) =>
      id === null ? rates.createCard(payload) : rates.updateCard(id, payload),
    onSuccess: async (card) => {
      toast.success("Rate card saved", { description: `${card.code} — ${card.name}.` });
      setCardModal({ open: false, card: null });
      await refreshCards(card.id);
    },
    onError: (error: unknown) =>
      toast.error("Could not save the rate card", { description: errorMessage(error), duration: null }),
  });

  const deactivateCardMutation = useMutation({
    mutationFn: (id: number) => rates.deactivateCard(id),
    onSuccess: async () => {
      toast.success("Rate card deactivated");
      await refreshCards();
    },
    onError: (error: unknown) =>
      toast.error("Could not deactivate the rate card", { description: errorMessage(error) }),
  });

  const saveEntryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: RateEntryPayload }) =>
      id === null
        ? rates.addEntry(selectedCardId as number, payload)
        : rates.updateEntry(id, payload),
    onSuccess: async () => {
      toast.success("Lane saved");
      setEntryModal({ open: false, entry: null });
      await refreshCards(selectedCardId ?? undefined);
    },
    onError: (error: unknown) =>
      toast.error("Could not save the lane", { description: errorMessage(error), duration: null }),
  });

  const removeEntryMutation = useMutation({
    mutationFn: (id: number) => rates.removeEntry(id),
    onSuccess: async () => {
      toast.success("Lane removed");
      await refreshCards(selectedCardId ?? undefined);
    },
    onError: (error: unknown) =>
      toast.error("Could not remove the lane", { description: errorMessage(error) }),
  });

  const saveSurchargeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: SurchargePayload }) =>
      id === null ? rates.createSurcharge(payload) : rates.updateSurcharge(id, payload),
    onSuccess: async (surcharge) => {
      toast.success("Surcharge saved", { description: `${surcharge.code} — ${surcharge.name}.` });
      setSurchargeModal({ open: false, surcharge: null });
      await cache.invalidateQueries({ queryKey: queryKeys.rates.surcharges });
    },
    onError: (error: unknown) =>
      toast.error("Could not save the surcharge", { description: errorMessage(error), duration: null }),
  });

  const retireSurchargeMutation = useMutation({
    mutationFn: (id: number) => rates.updateSurcharge(id, { is_active: false }),
    onSuccess: async () => {
      toast.success("Surcharge deactivated", {
        description: "It is retired rather than deleted, so historic quotes still resolve.",
      });
      await cache.invalidateQueries({ queryKey: queryKeys.rates.surcharges });
    },
    onError: (error: unknown) =>
      toast.error("Could not deactivate the surcharge", { description: errorMessage(error) }),
  });

  const selectedCard = cardQuery.data ?? null;
  const cardOptions: SelectOption[] = cards.map((card) => ({
    value: String(card.id),
    label: `${card.code} — ${card.name}`,
  }));

  // ── Cards pane ────────────────────────────────────────────────────────

  const cardColumns: DataTableColumn<RateCard>[] = [
    {
      id: "card",
      header: "Card",
      primary: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[color:var(--brand-navy)]">{row.code}</span>
          <span className="block text-xs text-slate-600">{row.name}</span>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.code,
    },
    {
      id: "scope",
      header: "Scope",
      cell: (row) => (
        <div className="text-sm text-slate-700">
          {titleCase(row.scope)}
          <span className="block text-xs text-slate-600">{titleCase(row.service_level)}</span>
        </div>
      ),
    },
    {
      id: "audience",
      header: "Audience",
      cell: (row) =>
        row.merchant_id === null ? (
          <Badge tone="neutral" variant="outline">
            Public
          </Badge>
        ) : (
          <Badge tone="indigo">Contract · merchant #{row.merchant_id}</Badge>
        ),
    },
    {
      id: "rules",
      header: "Weight rules",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-right text-xs tabular-nums text-slate-700">
          ÷{row.volumetric_divisor} · min {formatWeight(row.min_chargeable_weight_kg)} · step{" "}
          {formatWeight(row.weight_step_kg)}
        </span>
      ),
    },
    {
      id: "addons",
      header: "Add-ons",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-right text-xs tabular-nums text-slate-700">
          fuel {formatPercent(row.fuel_surcharge_percent)} · VAT {formatPercent(row.vat_percent)} · COD{" "}
          {formatPercent(row.cod_fee_percent)}
        </span>
      ),
    },
    {
      id: "effective",
      header: "Effective",
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {formatDay(row.effective_from)} – {row.effective_to ? formatDay(row.effective_to) : "open"}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <ActiveBadge active={row.is_active} />
          {row.is_default && <Badge tone="yellow">Default</Badge>}
        </div>
      ),
    },
    {
      id: "entries",
      header: "Lanes",
      align: "right",
      cell: (row) => <span className="tabular-nums text-sm text-slate-700">{row.entry_count}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCardId(row.id);
              setTab("entries");
            }}
          >
            Lanes
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setCardModal({ open: true, card: row })}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setDeactivateCard(row)}
            disabled={!row.is_active}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const cardsPane = (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          A card holds the arithmetic — volumetric divisor, weight rounding, fuel, VAT, COD and insurance
          percentages. A card with a merchant attached is a contract rate only that merchant is quoted.
        </p>
        <Button type="button" onClick={() => setCardModal({ open: true, card: null })}>
          New rate card
        </Button>
      </div>

      {cardsQuery.isError ? (
        <QueryError
          error={cardsQuery.error}
          title="Could not load rate cards"
          onRetry={() => void cardsQuery.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="Rate cards"
              columns={cardColumns}
              rows={cards}
              rowKey={(row) => row.id}
              loading={cardsQuery.isLoading}
              emptyTitle="No rate cards yet"
              emptyDescription="Create one, then add the lanes it prices."
            />
          </div>

          {cardsQuery.data && (
            <Pagination
              className="mt-5"
              page={cardsQuery.data.page}
              pageCount={cardsQuery.data.pages}
              pageSize={cardsQuery.data.per_page}
              totalItems={cardsQuery.data.total}
              onPageChange={setCardPage}
              label="Rate cards pagination"
            />
          )}
        </>
      )}
    </>
  );

  // ── Entries pane ──────────────────────────────────────────────────────

  const entryColumns: DataTableColumn<RateCardEntry>[] = [
    {
      id: "lane",
      header: "Lane",
      primary: true,
      cell: (row) => {
        const kind = laneSpecificity(row);
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[color:var(--brand-navy)]">{laneLabel(row)}</span>
            <Badge tone={kind.tone} size="sm" variant="outline">
              {kind.label}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "band",
      header: "Weight band",
      align: "right",
      cell: (row) => (
        <span className="text-right text-sm tabular-nums text-slate-700">
          {formatWeight(row.min_weight_kg)} –{" "}
          {row.max_weight_kg === null ? "no cap" : formatWeight(row.max_weight_kg)}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.min_weight_kg,
    },
    {
      id: "base",
      header: "Base",
      align: "right",
      cell: (row) => <Money amount={row.base_price} currency={selectedCard?.currency} />,
      sortable: true,
      sortValue: (row) => row.base_price,
    },
    {
      id: "perKg",
      header: "Per kg",
      align: "right",
      cell: (row) => <Money amount={row.price_per_kg} currency={selectedCard?.currency} muted />,
    },
    {
      id: "min",
      header: "Min charge",
      align: "right",
      hideOnMobile: true,
      cell: (row) => <Money amount={row.min_charge} currency={selectedCard?.currency} muted />,
    },
    {
      id: "transit",
      header: "Transit",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {row.transit_days_min === null && row.transit_days_max === null
            ? "—"
            : `${row.transit_days_min ?? "?"}–${row.transit_days_max ?? "?"} d`}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) => <ActiveBadge active={row.is_active} />,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEntryModal({ open: true, entry: row })}
          >
            Edit
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setRemoveEntry(row)}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const entriesPane = (
    <>
      <InfoNotice title="Which lane wins">
        The engine takes the most specific match: a <strong>district pair</strong> beats a{" "}
        <strong>zone pair</strong>, and a zone pair beats a <strong>destination country</strong>. Within
        the same keying, the lane whose weight band contains the chargeable weight is used. Overlapping
        bands are resolved by the server, so keep them disjoint.
      </InfoNotice>

      <div className="mt-5 mb-5 flex flex-wrap items-end justify-between gap-3">
        <Field label="Rate card" className="min-w-64">
          <Select
            value={selectedCardId === null ? "" : String(selectedCardId)}
            onChange={(event) =>
              setSelectedCardId(event.target.value === "" ? null : Number(event.target.value))
            }
            placeholder="Choose a rate card"
            options={cardOptions}
            disabled={cardsQuery.isLoading || cardOptions.length === 0}
          />
        </Field>
        <Button
          type="button"
          onClick={() => setEntryModal({ open: true, entry: null })}
          disabled={selectedCardId === null}
        >
          Add lane
        </Button>
      </div>

      {selectedCardId === null ? (
        <div className="panel">
          <p className="text-sm text-slate-600">Pick a rate card to see the lanes it prices.</p>
        </div>
      ) : cardQuery.isError ? (
        <QueryError
          error={cardQuery.error}
          title="Could not load this rate card"
          onRetry={() => void cardQuery.refetch()}
        />
      ) : (
        <div className="panel p-0! sm:p-0!">
          <DataTable
            caption={selectedCard ? `Lanes on ${selectedCard.code}` : "Lanes"}
            columns={entryColumns}
            rows={selectedCard?.entries ?? []}
            rowKey={(row) => row.id}
            loading={cardQuery.isLoading}
            emptyTitle="This card prices no lanes yet"
            emptyDescription="Add a zone pair to cover the whole country, then override individual district pairs."
          />
        </div>
      )}
    </>
  );

  // ── Surcharges pane ───────────────────────────────────────────────────

  const surchargeColumns: DataTableColumn<Surcharge>[] = [
    {
      id: "surcharge",
      header: "Surcharge",
      primary: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[color:var(--brand-navy)]">{row.name}</span>
          <span className="block text-xs text-slate-600">{row.code}</span>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.name,
    },
    {
      id: "appliesTo",
      header: "Applies to",
      cell: (row) => <span className="text-sm text-slate-700">{titleCase(row.applies_to)}</span>,
    },
    {
      id: "calculation",
      header: "Calculation",
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {row.calculation === "percent"
            ? `${row.value}% of freight`
            : row.calculation === "per_kg"
              ? `${row.value} per kg`
              : "Flat"}
        </span>
      ),
    },
    {
      id: "value",
      header: "Value",
      align: "right",
      cell: (row) =>
        row.calculation === "percent" ? (
          <span className="text-right text-sm tabular-nums font-semibold text-slate-800">
            {formatPercent(row.value)}
          </span>
        ) : (
          <Money amount={row.value} />
        ),
    },
    {
      id: "bounds",
      header: "Bounds",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-right text-xs tabular-nums text-slate-700">
          min {row.min_amount} · max {row.max_amount === null ? "uncapped" : row.max_amount}
        </span>
      ),
    },
    {
      id: "zone",
      header: "Zone",
      cell: (row) => (
        <span className="text-sm text-slate-700">{row.zone ? titleCase(row.zone) : "All"}</span>
      ),
    },
    {
      id: "taxable",
      header: "Taxable",
      cell: (row) => (
        <Badge tone={row.is_taxable ? "blue" : "neutral"} variant="outline">
          {row.is_taxable ? "Taxable" : "Exempt"}
        </Badge>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) => <ActiveBadge active={row.is_active} />,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setSurchargeModal({ open: true, surcharge: row })}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRetireSurcharge(row)}
            disabled={!row.is_active}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const surchargesPane = (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Named lines that ride on top of freight. There is no delete — retiring one deactivates it so
          historic quotes still resolve.
        </p>
        <Button type="button" onClick={() => setSurchargeModal({ open: true, surcharge: null })}>
          New surcharge
        </Button>
      </div>

      {surchargesQuery.isError ? (
        <QueryError
          error={surchargesQuery.error}
          title="Could not load surcharges"
          onRetry={() => void surchargesQuery.refetch()}
        />
      ) : (
        <div className="panel p-0! sm:p-0!">
          <DataTable
            caption="Surcharges"
            columns={surchargeColumns}
            rows={surchargesQuery.data ?? []}
            rowKey={(row) => row.id}
            loading={surchargesQuery.isLoading}
            emptyTitle="No surcharges defined"
            emptyDescription="Add one for fragile handling, remote delivery or weekend service."
          />
        </div>
      )}
    </>
  );

  return (
    <>
      <FinanceHeader
        title="Rates"
        description="Rate cards, the lanes they price, and the surcharges on top. Every number shown comes back from the rate engine."
      />

      <Tabs
        label="Tariff sections"
        value={tab}
        onValueChange={setTab}
        items={[
          { id: "cards", label: "Rate cards", content: cardsPane },
          { id: "entries", label: "Entries", content: entriesPane },
          { id: "surcharges", label: "Surcharges", content: surchargesPane },
        ]}
      />

      <QuoteTester districts={districtsQuery.data ?? []} />

      {/* ── Rate card create / edit ────────────────────────────────────── */}
      <Modal
        open={cardModal.open}
        onClose={() => setCardModal({ open: false, card: null })}
        size="xl"
        title={cardModal.card ? `Edit ${cardModal.card.code}` : "New rate card"}
        description="Lanes are added separately on the Entries tab once the card exists."
      >
        <RateCardForm
          key={cardModal.card ? `card-${cardModal.card.id}` : "card-new"}
          card={cardModal.card}
          busy={saveCardMutation.isPending}
          onCancel={() => setCardModal({ open: false, card: null })}
          onSubmit={(payload) =>
            saveCardMutation.mutate({ id: cardModal.card ? cardModal.card.id : null, payload })
          }
        />
      </Modal>

      <ConfirmDialog
        open={deactivateCard !== null}
        onClose={() => setDeactivateCard(null)}
        tone="danger"
        onConfirm={async () => {
          if (!deactivateCard) return;
          try {
            await deactivateCardMutation.mutateAsync(deactivateCard.id);
          } catch {
            // Surfaced by the mutation's onError toast.
          }
        }}
        title="Deactivate this rate card?"
        description={
          deactivateCard
            ? `${deactivateCard.code} stops matching new quotes immediately. Shipments already priced from it keep their price.`
            : undefined
        }
        confirmLabel="Deactivate"
      />

      {/* ── Lane create / edit ─────────────────────────────────────────── */}
      <Modal
        open={entryModal.open}
        onClose={() => setEntryModal({ open: false, entry: null })}
        size="lg"
        title={entryModal.entry ? "Edit lane" : "Add a lane"}
        description={selectedCard ? `On ${selectedCard.code} — ${selectedCard.name}.` : undefined}
      >
        <RateEntryForm
          key={entryModal.entry ? `entry-${entryModal.entry.id}` : "entry-new"}
          entry={entryModal.entry}
          districts={districtsQuery.data ?? []}
          currency={selectedCard?.currency ?? "NPR"}
          busy={saveEntryMutation.isPending}
          onCancel={() => setEntryModal({ open: false, entry: null })}
          onSubmit={(payload) =>
            saveEntryMutation.mutate({ id: entryModal.entry ? entryModal.entry.id : null, payload })
          }
        />
      </Modal>

      <ConfirmDialog
        open={removeEntry !== null}
        onClose={() => setRemoveEntry(null)}
        tone="danger"
        onConfirm={async () => {
          if (!removeEntry) return;
          try {
            await removeEntryMutation.mutateAsync(removeEntry.id);
          } catch {
            // Surfaced by the mutation's onError toast.
          }
        }}
        title="Remove this lane?"
        description={
          removeEntry
            ? `${laneLabel(removeEntry)} is deleted outright. Any quote that relied on it will fall back to a less specific lane, or return no rate.`
            : undefined
        }
        confirmLabel="Remove lane"
      />

      {/* ── Surcharge create / edit ────────────────────────────────────── */}
      <Modal
        open={surchargeModal.open}
        onClose={() => setSurchargeModal({ open: false, surcharge: null })}
        size="lg"
        title={surchargeModal.surcharge ? `Edit ${surchargeModal.surcharge.code}` : "New surcharge"}
      >
        <SurchargeForm
          key={
            surchargeModal.surcharge ? `surcharge-${surchargeModal.surcharge.id}` : "surcharge-new"
          }
          surcharge={surchargeModal.surcharge}
          busy={saveSurchargeMutation.isPending}
          onCancel={() => setSurchargeModal({ open: false, surcharge: null })}
          onSubmit={(payload) =>
            saveSurchargeMutation.mutate({
              id: surchargeModal.surcharge ? surchargeModal.surcharge.id : null,
              payload,
            })
          }
        />
      </Modal>

      <ConfirmDialog
        open={retireSurcharge !== null}
        onClose={() => setRetireSurcharge(null)}
        onConfirm={async () => {
          if (!retireSurcharge) return;
          try {
            await retireSurchargeMutation.mutateAsync(retireSurcharge.id);
          } catch {
            // Surfaced by the mutation's onError toast.
          }
        }}
        title="Deactivate this surcharge?"
        description={
          retireSurcharge
            ? `${retireSurcharge.name} stops applying to new quotes. Surcharges cannot be deleted, so this is reversible from the edit form.`
            : undefined
        }
        confirmLabel="Deactivate"
      />
    </>
  );
}
