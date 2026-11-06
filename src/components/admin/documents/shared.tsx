"use client";

/**
 * Pieces shared by the packing-list and freight-bill screens.
 *
 * Both documents are the same shape of job — fill a form, save a draft,
 * write the Excel file, hand the file to the office — so the status
 * vocabulary, the generate/download pair and the shipment prefill are
 * decided once here rather than twice.
 */

import { useState } from "react";
import { Badge, Button, Field, Input, useToast, type BadgeTone } from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import type { FetchedFile } from "@/lib/resources/client";
import { shipments } from "@/lib/resources/operations";
import type { Shipment } from "@/types/logistics";
import { cn } from "@/lib/utils";

/* ── Status presentation ────────────────────────────────────────────────── */

const DOCUMENT_TONES: Record<string, BadgeTone> = {
  draft: "neutral",
  finalized: "green",
  issued: "blue",
  paid: "green",
  cancelled: "red",
};

export function documentLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase());
}

export function DocumentStatusBadge({ status }: { status: string }) {
  return <Badge tone={DOCUMENT_TONES[status] ?? "neutral"}>{documentLabel(status)}</Badge>;
}

/* ── Column limits ──────────────────────────────────────────────────────── */

/**
 * What each column will actually hold.
 *
 * SQLite lets an over-long value through and MySQL does not, so the office
 * would find out on the production host rather than here. These are the
 * model's own widths, used as `maxLength` on the inputs that feed them.
 */
export const LIMITS = {
  name: 200,
  /** `Text` in the database; 5000 is where the request validator stops. */
  address: 5000,
  phone: 50,
  country: 100,
  email: 200,
  invoiceNo: 60,
  modeOfShipment: 40,
  goodsSummary: 255,
  quantityUnit: 20,
  awbNo: 60,
  words: 300,
  notes: 5000,
} as const;

/* ── Saving a generated file ────────────────────────────────────────────── */

/** Hand a fetched file to the browser's downloads, then release the URL. */
export function saveFile(file: FetchedFile, fallbackName: string): void {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName ?? fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cut the download short in some browsers; a tick
  // later the navigation has already been handed off.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export interface GenerateDownloadProps {
  /** Writes the workbook on the server and answers with its file name. */
  onGenerate: () => Promise<{ file_name: string }>;
  /** Streams the workbook back. 404s until `onGenerate` has run once. */
  onDownload: () => Promise<FetchedFile>;
  /** Null until the document has been generated at least once. */
  fileName: string | null;
  /** Disabled while the form holds changes that are not saved yet. */
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
}

/**
 * Generate and download, as one control.
 *
 * They are two calls and stay two buttons: re-generating after an edit is a
 * deliberate act, and the office needs to be able to fetch the file it
 * already has without rewriting it.
 */
export function GenerateDownload({
  onGenerate,
  onDownload,
  fileName,
  disabled = false,
  disabledReason,
  className,
}: GenerateDownloadProps) {
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      const result = await onGenerate();
      toast.success("Excel written", { description: result.file_name });
    } catch (error) {
      toast.error("Could not write the Excel file", {
        description: errorMessage(error),
        duration: null,
      });
    } finally {
      setGenerating(false);
    }
  }

  async function download() {
    setDownloading(true);
    try {
      saveFile(await onDownload(), fileName ?? "document.xlsx");
    } catch (error) {
      toast.error("Could not download the Excel file", {
        description: errorMessage(error),
        duration: null,
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        loading={generating}
        loadingLabel="Writing"
        onClick={generate}
      >
        {fileName ? "Re-generate Excel" : "Generate Excel"}
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={disabled || !fileName}
        loading={downloading}
        loadingLabel="Downloading"
        onClick={download}
      >
        Download
      </Button>
      <p className="text-xs text-slate-600">
        {disabled && disabledReason
          ? disabledReason
          : fileName
            ? fileName
            : "Nothing generated yet."}
      </p>
    </div>
  );
}

/* ── Prefill from a shipment ────────────────────────────────────────────── */

export interface ShipmentPrefillProps {
  /** The id currently typed, as text, so an empty box stays empty. */
  value: string;
  onChange: (value: string) => void;
  /** Called with the shipment once it has been read back. */
  onPrefill: (shipment: Shipment) => void;
  /** What the button says it will overwrite. */
  fills: string;
  disabled?: boolean;
}

/**
 * The shipment this document belongs to, and a button that copies the
 * parties off it.
 *
 * Prefilling is kept separate from the link itself: a document can be filed
 * against a shipment whose addresses were corrected afterwards, and copying
 * on save would quietly undo the correction.
 */
export function ShipmentPrefill({
  value,
  onChange,
  onPrefill,
  fills,
  disabled = false,
}: ShipmentPrefillProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const id = Number(value.trim());
  const usable = value.trim() !== "" && Number.isInteger(id) && id > 0;

  async function prefill() {
    setLoading(true);
    try {
      const shipment = await shipments.get(id);
      onPrefill(shipment);
      toast.success("Filled from the shipment", { description: shipment.tracking_no });
    } catch (error) {
      toast.error("Could not read that shipment", { description: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field
        label="Shipment id"
        showOptional
        className="w-40"
        hint="Links the document to a booking."
      >
        <Input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          className="text-right tabular-nums"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mb-1.5"
        disabled={disabled || !usable}
        loading={loading}
        loadingLabel="Reading"
        onClick={prefill}
      >
        Prefill {fills}
      </Button>
    </div>
  );
}

/* ── Form value coercion ────────────────────────────────────────────────── */

/**
 * `""` means "not given" for an optional numeric input, not zero.
 *
 * Stricter than the finance screens' version of the same name: the document
 * validator runs `number(value, minimum=0)` over every figure it is sent, so
 * a negative here would be a 400 rather than a saved negative.
 */
export function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** A quantity the API will accept: a non-negative integer, never NaN. */
export function wholeNumber(value: string): number {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

/** A text field the API will accept. `null` is refused by the validator. */
export function textValue(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** Keeps an editor row identifiable across reorders and removals. */
let rowCounter = 0;
export function nextRowKey(prefix: string): string {
  rowCounter += 1;
  return `${prefix}-${rowCounter}`;
}

/** Move one entry of a list, returning a new list. */
export function moved<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [entry] = next.splice(from, 1);
  next.splice(to, 0, entry);
  return next;
}
