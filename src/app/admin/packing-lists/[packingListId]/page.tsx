"use client";

/**
 * One packing list: edit it, write the Excel file, hand the file over.
 *
 * The file is written from the stored record, not from what is on screen, so
 * the generate control says so rather than quietly producing a document that
 * does not match the form.
 *
 * A finalized list is read-only to everyone but an administrator, which is
 * the API's own rule; the form is rendered disabled rather than offering a
 * save the server will refuse.
 */

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumbs,
  Button,
  ConfirmDialog,
  Skeleton,
  useToast,
} from "@/components/kit";
import { useState } from "react";
import { Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { QueryError } from "@/components/admin/finance/shared";
import { PackingListForm } from "@/components/admin/documents/PackingListForm";
import {
  DocumentStatusBadge,
  GenerateDownload,
} from "@/components/admin/documents/shared";
import { packingLists, type PackingListWrite } from "@/lib/resources/documents";
import { errorMessage } from "@/lib/resources/client";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
  const params = useParams<{ packingListId: string }>();
  const documentId = Number(params.packingListId);
  const router = useRouter();
  const toast = useToast();
  const cache = useQueryClient();
  const { user } = useAuth();
  const [removing, setRemoving] = useState(false);

  const detail = useQuery({
    queryKey: queryKeys.packingLists.detail(documentId),
    queryFn: () => packingLists.get(documentId),
    enabled: Number.isFinite(documentId),
  });

  const document = detail.data ?? null;
  const isAdmin = Boolean(user?.is_admin);
  const locked = document?.status === "finalized" && !isAdmin;

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.packingLists.all });
  }

  const save = useMutation({
    mutationFn: (payload: PackingListWrite) => packingLists.update(documentId, payload),
    onSuccess: async (row) => {
      toast.success("Packing list saved", { description: row.pl_number });
      await refresh();
    },
    onError: (cause: unknown) =>
      toast.error("Could not save the packing list", {
        description: errorMessage(cause),
        duration: null,
      }),
  });

  const remove = useMutation({
    mutationFn: () => packingLists.remove(documentId),
    onSuccess: async () => {
      toast.success("Packing list deleted");
      await refresh();
      router.push("/admin/packing-lists");
    },
    onError: (cause: unknown) =>
      toast.error("Could not delete the packing list", { description: errorMessage(cause) }),
  });

  return (
    <>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Packing lists", href: "/admin/packing-lists" },
          { label: document?.pl_number ?? "Packing list" },
        ]}
      />

      <ScreenHeader
        eyebrow="Documents"
        title={document?.pl_number ?? "Packing list"}
        description={
          document
            ? `Raised ${when(document.created_at)} · ${document.total_packages} cartons · ${
                document.total_items
              } ${document.quantity_unit || "PCS"}`
            : undefined
        }
        actions={
          document ? (
            <>
              <DocumentStatusBadge status={document.status} />
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
          title="Could not load this packing list"
          onRetry={() => detail.refetch()}
        />
      ) : !document ? (
        <Skeleton lines={10} />
      ) : (
        <div className="space-y-6">
          <section aria-label="Excel file" className="panel">
            <h2 className="eyebrow mb-2">Excel file</h2>
            <p className="mb-3 text-sm text-slate-700">
              The workbook is written from the saved record, so save any changes below before
              generating it again.
            </p>
            <GenerateDownload
              fileName={document.file_name}
              onGenerate={async () => {
                const result = await packingLists.generate(documentId);
                await refresh();
                return result;
              }}
              onDownload={() => packingLists.file(documentId)}
            />
          </section>

          {locked && (
            <Notice tone="warning" title="This packing list is finalized">
              Only an administrator can edit or delete it, so the form below is read-only.
            </Notice>
          )}

          {/*
            Keyed on the id alone: the form holds the operator's edits, and
            remounting it on every refetch — a generate commits a new
            `updated_at` — would throw away whatever they were in the middle
            of typing.
          */}
          <PackingListForm
            key={document.id}
            document={document}
            busy={save.isPending}
            readOnly={locked}
            submitLabel="Save changes"
            onCancel={() => router.push("/admin/packing-lists")}
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
        title={`Delete ${document?.pl_number ?? "this packing list"}?`}
        description="The record and its generated Excel file go for good."
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
