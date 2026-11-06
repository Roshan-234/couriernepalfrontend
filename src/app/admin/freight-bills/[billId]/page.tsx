"use client";

/**
 * One freight bill: edit it, write the Excel file, hand the file over.
 *
 * The workbook is built from the stored record, so the generate control says
 * so rather than quietly producing a bill that does not match the form.
 *
 * Anything past draft is read-only to a non-administrator, which is the API's
 * own rule — the form is rendered disabled rather than offering a save the
 * server will refuse.
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumbs, Button, ConfirmDialog, Skeleton, useToast } from "@/components/kit";
import { Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { QueryError } from "@/components/admin/finance/shared";
import { formatMoney } from "@/components/admin/finance/money";
import { FreightBillForm } from "@/components/admin/documents/FreightBillForm";
import { DocumentStatusBadge, GenerateDownload } from "@/components/admin/documents/shared";
import { freightBills, type FreightBillWrite } from "@/lib/resources/documents";
import { errorMessage } from "@/lib/resources/client";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
  const params = useParams<{ billId: string }>();
  const billId = Number(params.billId);
  const router = useRouter();
  const toast = useToast();
  const cache = useQueryClient();
  const { user } = useAuth();
  const [removing, setRemoving] = useState(false);

  const detail = useQuery({
    queryKey: queryKeys.freightBills.detail(billId),
    queryFn: () => freightBills.get(billId),
    enabled: Number.isFinite(billId),
  });

  const bill = detail.data ?? null;
  const isAdmin = Boolean(user?.is_admin);
  const locked = bill !== null && bill.status !== "draft" && !isAdmin;

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.freightBills.all });
  }

  const save = useMutation({
    mutationFn: (payload: FreightBillWrite) => freightBills.update(billId, payload),
    onSuccess: async (row) => {
      toast.success("Freight bill saved", { description: row.invoice_number });
      await refresh();
    },
    onError: (cause: unknown) =>
      toast.error("Could not save the freight bill", {
        description: errorMessage(cause),
        duration: null,
      }),
  });

  const remove = useMutation({
    mutationFn: () => freightBills.remove(billId),
    onSuccess: async () => {
      toast.success("Freight bill deleted");
      await refresh();
      router.push("/admin/freight-bills");
    },
    onError: (cause: unknown) =>
      toast.error("Could not delete the freight bill", { description: errorMessage(cause) }),
  });

  return (
    <>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Freight bills", href: "/admin/freight-bills" },
          { label: bill?.invoice_number ?? "Freight bill" },
        ]}
      />

      <ScreenHeader
        eyebrow="Documents"
        title={bill?.invoice_number ?? "Freight bill"}
        description={
          bill
            ? `Raised ${when(bill.created_at)} · ${formatMoney(bill.subtotal, bill.currency)}${
                bill.total_npr ? ` · ${formatMoney(bill.total_npr, "NPR")}` : ""
              }`
            : undefined
        }
        actions={
          bill ? (
            <>
              <DocumentStatusBadge status={bill.status} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setRemoving(true)}>
                Delete
              </Button>
            </>
          ) : undefined
        }
      />

      {detail.isError ? (
        <QueryError
          error={detail.error}
          title="Could not load this freight bill"
          onRetry={() => detail.refetch()}
        />
      ) : !bill ? (
        <Skeleton lines={10} />
      ) : (
        <div className="space-y-6">
          <section aria-label="Excel file" className="panel">
            <h2 className="eyebrow mb-2">Excel file</h2>
            <p className="mb-3 text-sm text-slate-700">
              The workbook is written from the saved record, so save any changes below before
              generating it again. The amount in words is written at this point unless a wording
              was saved on the bill.
            </p>
            <GenerateDownload
              fileName={bill.file_name}
              onGenerate={async () => {
                const result = await freightBills.generate(billId);
                await refresh();
                return result;
              }}
              onDownload={() => freightBills.file(billId)}
            />
          </section>

          {locked && (
            <Notice tone="warning" title={`This bill is ${bill.status}`}>
              Only an administrator can edit or delete a bill once it has left draft, so the form
              below is read-only.
            </Notice>
          )}

          {/*
            Keyed on the id alone, so a refetch — a generate commits a new
            `updated_at` — does not throw away edits in progress.
          */}
          <FreightBillForm
            key={bill.id}
            bill={bill}
            isAdmin={isAdmin}
            busy={save.isPending}
            readOnly={locked}
            submitLabel="Save changes"
            onCancel={() => router.push("/admin/freight-bills")}
            onSubmit={(payload) => save.mutate(payload)}
          />
        </div>
      )}

      <ConfirmDialog
        open={removing}
        onClose={() => setRemoving(false)}
        onConfirm={async () => {
          await remove.mutateAsync();
          setRemoving(false);
        }}
        title={`Delete ${bill?.invoice_number ?? "this freight bill"}?`}
        description="The record and its generated Excel file go for good."
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
