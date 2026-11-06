"use client";

/** A new packing list. Saves as a draft and opens it for generating. */

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumbs, useToast } from "@/components/kit";
import { ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { PackingListForm } from "@/components/admin/documents/PackingListForm";
import { packingLists, type PackingListWrite } from "@/lib/resources/documents";
import { errorMessage } from "@/lib/resources/client";
import { queryKeys } from "@/lib/queryKeys";

export default function Page() {
  const router = useRouter();
  const toast = useToast();
  const cache = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: PackingListWrite) => packingLists.create(payload),
    onSuccess: async (document) => {
      toast.success("Packing list saved", { description: document.pl_number });
      await cache.invalidateQueries({ queryKey: queryKeys.packingLists.all });
      router.replace(`/admin/packing-lists/${document.id}`);
    },
    onError: (cause: unknown) =>
      toast.error("Could not save the packing list", {
        description: errorMessage(cause),
        duration: null,
      }),
  });

  return (
    <>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Packing lists", href: "/admin/packing-lists" },
          { label: "New" },
        ]}
      />
      <ScreenHeader
        eyebrow="Documents"
        title="New packing list"
        description="The number is assigned on save. Generate the Excel file from the saved record."
      />
      <PackingListForm
        document={null}
        busy={create.isPending}
        submitLabel="Save packing list"
        onCancel={() => router.push("/admin/packing-lists")}
        onSubmit={(payload) => create.mutate(payload)}
      />
    </>
  );
}
