"use client";

/**
 * The charge-line editor for a freight bill.
 *
 * A freight bill charges for carriage, so a line is one piece of wording and
 * one amount — "Air freight charge 45kgs x 3.20", USD 144.00. The weight and
 * the rate live inside the wording because that is how the office writes
 * them; there is deliberately no quantity column here to tempt anyone into
 * entering the same figures twice.
 *
 * What the API stores is a different shape — see `chargeLine` in
 * `lib/resources/documents` — and the conversion happens on the way out.
 */

import {
  Button,
  Input,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/kit";
import { chargeAmount, chargeLine, type FreightBillCharge } from "@/lib/resources/documents";
import { moved, nextRowKey, optionalNumber } from "./shared";

export interface ChargeRow {
  key: string;
  description: string;
  amount: string;
}

export function emptyChargeRow(): ChargeRow {
  return { key: nextRowKey("charge"), description: "", amount: "" };
}

export function rowsFromCharges(lines: FreightBillCharge[]): ChargeRow[] {
  if (lines.length === 0) return [emptyChargeRow()];
  return lines.map((line) => ({
    key: nextRowKey("charge"),
    description: line.description ?? "",
    amount: String(chargeAmount(line)),
  }));
}

/**
 * Drop blank rows and convert to the shape the API will keep. A line with
 * wording but no amount is kept: the generator prints it without a figure,
 * which is how a note is carried on the bill.
 */
export function chargesFromRows(rows: ChargeRow[]): FreightBillCharge[] {
  const lines: FreightBillCharge[] = [];
  for (const row of rows) {
    const description = row.description.trim();
    const amount = optionalNumber(row.amount);
    if (description === "" && amount === undefined) continue;
    lines.push(chargeLine(description, amount ?? 0));
  }
  return lines;
}

/** What the bill converts at the agreed rate. */
export function rowsSubtotal(rows: ChargeRow[]): number {
  const sum = rows.reduce((total, row) => total + (optionalNumber(row.amount) ?? 0), 0);
  return Math.round(sum * 100) / 100;
}

export interface ChargeEditorProps {
  rows: ChargeRow[];
  onChange: (rows: ChargeRow[]) => void;
  currency: string;
  disabled?: boolean;
}

export function ChargeEditor({ rows, onChange, currency, disabled = false }: ChargeEditorProps) {
  const code = currency.trim().toUpperCase() || "USD";

  const update = (index: number, patch: Partial<ChargeRow>) =>
    onChange(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      <Table
        caption="Charge lines on this freight bill"
        captionVisible={false}
        className="text-sm"
      >
        <THead>
          <TR>
            <TH className="w-[62%]">Particular</TH>
            <TH align="right" className="w-[20%]">
              Amount ({code})
            </TH>
            <TH srOnly align="right">
              Row actions
            </TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row, index) => (
            <TR key={row.key}>
              <TD className="px-2 py-2">
                <Input
                  aria-label={`Particular, line ${index + 1}`}
                  value={row.description}
                  disabled={disabled}
                  maxLength={255}
                  placeholder="Air freight charge 45kgs x 3.20"
                  autoComplete="off"
                  onChange={(event) => update(index, { description: event.target.value })}
                />
              </TD>
              <TD className="px-2 py-2">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="text-right tabular-nums"
                  aria-label={`Amount, line ${index + 1}`}
                  value={row.amount}
                  disabled={disabled}
                  onChange={(event) => update(index, { amount: event.target.value })}
                />
              </TD>
              <TD align="right" className="whitespace-nowrap px-2 py-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled || index === 0}
                  onClick={() => onChange(moved(rows, index, index - 1))}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled || index === rows.length - 1}
                  onClick={() => onChange(moved(rows, index, index + 1))}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled || rows.length === 1}
                  onClick={() => onChange(rows.filter((_, position) => position !== index))}
                >
                  Remove
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onChange([...rows, emptyChargeRow()])}
      >
        Add line
      </Button>
    </div>
  );
}

export default ChargeEditor;
