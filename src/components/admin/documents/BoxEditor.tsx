"use client";

/**
 * The box-grouped item editor for a packing list.
 *
 * A packing list is not a flat list of goods: it reads BOX NO:01, its
 * contents, BOX NO:02, its contents, and then one quantity total across all
 * of them, because customs and the receiving agent work carton by carton.
 * The editor is grouped the same way, so what the operator sees on screen is
 * the shape of the document that comes out of the printer.
 *
 * A group with no label is legal and prints as plain rows with no heading, so
 * a simple list of items still works. Clearing a box's label is how an
 * operator gets back to one.
 *
 * The grouping here matches `_boxes` in the generator exactly: labels appear
 * in the order they were first used, and every item carrying a label joins
 * that label's group wherever it sits in the array. Anything else and the
 * screen would disagree with the file.
 */

import {
  Button,
  Field,
  Input,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/kit";
import type { PackingListItem } from "@/lib/resources/documents";
import { moved, nextRowKey, optionalNumber, wholeNumber } from "./shared";

export interface BoxItemRow {
  key: string;
  description: string;
  cms: string;
  quantity: string;
  remarks: string;
  unitWeight: string;
}

export interface BoxGroup {
  key: string;
  /** "" is the unlabelled group: its rows print with no heading. */
  label: string;
  items: BoxItemRow[];
}

export function emptyItemRow(): BoxItemRow {
  return {
    key: nextRowKey("item"),
    description: "",
    cms: "",
    quantity: "",
    remarks: "",
    unitWeight: "",
  };
}

/** A fresh box, labelled in the office's own style for the next carton. */
export function emptyBoxGroup(index: number): BoxGroup {
  return {
    key: nextRowKey("box"),
    label: `BOX NO:${String(index + 1).padStart(2, "0")}`,
    items: [emptyItemRow()],
  };
}

/** Read a stored item list back into grouped editor rows. */
export function groupsFromItems(items: PackingListItem[]): BoxGroup[] {
  const groups = new Map<string, BoxGroup>();
  const order: string[] = [];

  for (const item of items) {
    const label = (item.box ?? "").trim();
    if (!groups.has(label)) {
      groups.set(label, { key: nextRowKey("box"), label, items: [] });
      order.push(label);
    }
    groups.get(label)!.items.push({
      key: nextRowKey("item"),
      description: item.description ?? "",
      cms: item.cms ?? "",
      quantity: item.quantity === undefined || item.quantity === null ? "" : String(item.quantity),
      remarks: item.remarks ?? "",
      unitWeight:
        item.unit_weight_kg === undefined || item.unit_weight_kg === null
          ? ""
          : String(item.unit_weight_kg),
    });
  }

  if (order.length === 0) return [emptyBoxGroup(0)];
  return order.map((label) => groups.get(label)!);
}

/**
 * Flatten the editor back to the stored shape.
 *
 * A row with nothing written in it is dropped rather than sent as an empty
 * line: the generator prints every item it is given, and a blank row in the
 * middle of a carton is a document the agent has to query.
 */
export function itemsFromGroups(groups: BoxGroup[]): PackingListItem[] {
  const items: PackingListItem[] = [];
  for (const group of groups) {
    const label = group.label.trim();
    for (const row of group.items) {
      const description = row.description.trim();
      const quantity = wholeNumber(row.quantity);
      if (description === "" && quantity === 0) continue;
      const item: PackingListItem = { description, quantity };
      if (label !== "") item.box = label;
      if (row.cms.trim() !== "") item.cms = row.cms.trim();
      if (row.remarks.trim() !== "") item.remarks = row.remarks.trim();
      const unitWeight = optionalNumber(row.unitWeight);
      if (unitWeight !== undefined) item.unit_weight_kg = unitWeight;
      items.push(item);
    }
  }
  return items;
}

/** Pieces counted in one carton, as the document's QTY column adds them up. */
export function groupQuantity(group: BoxGroup): number {
  return group.items.reduce((sum, row) => sum + wholeNumber(row.quantity), 0);
}

/** The figure the generated document prints on its TOTAL row. */
export function totalQuantity(groups: BoxGroup[]): number {
  return groups.reduce((sum, group) => sum + groupQuantity(group), 0);
}

/** Cartons, counted the way the carrier counts them: labelled groups. */
export function cartonCount(groups: BoxGroup[]): number {
  const labelled = groups.filter((group) => group.label.trim() !== "").length;
  if (labelled > 0) return labelled;
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

/** Labels used twice; the generator would merge them into one carton. */
export function duplicateLabels(groups: BoxGroup[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const group of groups) {
    const label = group.label.trim();
    if (label === "") continue;
    if (seen.has(label)) repeated.add(label);
    seen.add(label);
  }
  return [...repeated];
}

export interface BoxEditorProps {
  groups: BoxGroup[];
  onChange: (groups: BoxGroup[]) => void;
  /** Printed once in the QTY column header rather than on every row. */
  quantityUnit: string;
  disabled?: boolean;
}

export function BoxEditor({ groups, onChange, quantityUnit, disabled = false }: BoxEditorProps) {
  const unit = quantityUnit.trim() || "PCS";
  const repeated = duplicateLabels(groups);

  const replaceGroup = (index: number, next: BoxGroup) =>
    onChange(groups.map((group, position) => (position === index ? next : group)));

  const updateItem = (groupIndex: number, itemIndex: number, patch: Partial<BoxItemRow>) => {
    const group = groups[groupIndex];
    replaceGroup(groupIndex, {
      ...group,
      items: group.items.map((row, position) =>
        position === itemIndex ? { ...row, ...patch } : row,
      ),
    });
  };

  return (
    <div className="space-y-4">
      {repeated.length > 0 && (
        <p role="alert" className="text-sm font-semibold text-amber-800">
          {repeated.join(", ")} {repeated.length === 1 ? "is" : "are"} used on more than one box.
          The document merges boxes with the same label into one carton.
        </p>
      )}

      {groups.map((group, groupIndex) => {
        const quantity = groupQuantity(group);
        return (
          <section
            key={group.key}
            aria-label={group.label.trim() || "Items with no box"}
            className="rounded-[0.75rem] border border-slate-200"
          >
            <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Field
                label="Box label"
                className="w-56"
                hint="Clear it to leave these items ungrouped."
              >
                <Input
                  value={group.label}
                  disabled={disabled}
                  maxLength={60}
                  placeholder="BOX NO:01"
                  autoComplete="off"
                  onChange={(event) =>
                    replaceGroup(groupIndex, { ...group, label: event.target.value })
                  }
                />
              </Field>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-semibold tabular-nums text-[color:var(--brand-navy)]">
                  {quantity} {unit}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled || groupIndex === 0}
                  onClick={() => onChange(moved(groups, groupIndex, groupIndex - 1))}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled || groupIndex === groups.length - 1}
                  onClick={() => onChange(moved(groups, groupIndex, groupIndex + 1))}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled || groups.length === 1}
                  onClick={() =>
                    onChange(groups.filter((_, position) => position !== groupIndex))
                  }
                >
                  Remove box
                </Button>
              </div>
            </header>

            <Table
              caption={`Items in ${group.label.trim() || "the ungrouped rows"}`}
              captionVisible={false}
              className="text-sm"
            >
              <THead>
                <TR>
                  <TH className="w-[38%]">Description</TH>
                  <TH className="w-[14%]">Cms</TH>
                  <TH align="right" className="w-[10%]">
                    Qty ({unit})
                  </TH>
                  <TH align="right" className="w-[12%]">
                    Unit kg
                  </TH>
                  <TH className="w-[18%]">Remarks</TH>
                  <TH srOnly align="right">
                    Row actions
                  </TH>
                </TR>
              </THead>
              <TBody>
                {group.items.map((row, itemIndex) => (
                  <TR key={row.key}>
                    <TD className="px-2 py-2">
                      <Input
                        aria-label={`Description, row ${itemIndex + 1}`}
                        value={row.description}
                        disabled={disabled}
                        maxLength={255}
                        autoComplete="off"
                        onChange={(event) =>
                          updateItem(groupIndex, itemIndex, { description: event.target.value })
                        }
                      />
                    </TD>
                    <TD className="px-2 py-2">
                      <Input
                        aria-label={`Cms, row ${itemIndex + 1}`}
                        value={row.cms}
                        disabled={disabled}
                        maxLength={40}
                        placeholder="40x30x25"
                        autoComplete="off"
                        onChange={(event) =>
                          updateItem(groupIndex, itemIndex, { cms: event.target.value })
                        }
                      />
                    </TD>
                    <TD className="px-2 py-2">
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        className="text-right tabular-nums"
                        aria-label={`Quantity, row ${itemIndex + 1}`}
                        value={row.quantity}
                        disabled={disabled}
                        onChange={(event) =>
                          updateItem(groupIndex, itemIndex, { quantity: event.target.value })
                        }
                      />
                    </TD>
                    <TD className="px-2 py-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.001"
                        className="text-right tabular-nums"
                        aria-label={`Unit weight in kg, row ${itemIndex + 1}`}
                        value={row.unitWeight}
                        disabled={disabled}
                        onChange={(event) =>
                          updateItem(groupIndex, itemIndex, { unitWeight: event.target.value })
                        }
                      />
                    </TD>
                    <TD className="px-2 py-2">
                      <Input
                        aria-label={`Remarks, row ${itemIndex + 1}`}
                        value={row.remarks}
                        disabled={disabled}
                        maxLength={255}
                        autoComplete="off"
                        onChange={(event) =>
                          updateItem(groupIndex, itemIndex, { remarks: event.target.value })
                        }
                      />
                    </TD>
                    <TD align="right" className="whitespace-nowrap px-2 py-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={disabled || itemIndex === 0}
                        onClick={() =>
                          replaceGroup(groupIndex, {
                            ...group,
                            items: moved(group.items, itemIndex, itemIndex - 1),
                          })
                        }
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={disabled || itemIndex === group.items.length - 1}
                        onClick={() =>
                          replaceGroup(groupIndex, {
                            ...group,
                            items: moved(group.items, itemIndex, itemIndex + 1),
                          })
                        }
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={disabled || group.items.length === 1}
                        onClick={() =>
                          replaceGroup(groupIndex, {
                            ...group,
                            items: group.items.filter((_, position) => position !== itemIndex),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <div className="border-t border-slate-200 px-4 py-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() =>
                  replaceGroup(groupIndex, { ...group, items: [...group.items, emptyItemRow()] })
                }
              >
                Add item
              </Button>
            </div>
          </section>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange([...groups, emptyBoxGroup(groups.length)])}
        >
          Add box
        </Button>
        <p className="text-sm font-semibold text-[color:var(--brand-navy)]">
          {groups.length} {groups.length === 1 ? "box" : "boxes"} · total{" "}
          <span className="tabular-nums">{totalQuantity(groups)}</span> {unit}
        </p>
      </div>
    </div>
  );
}

export default BoxEditor;
