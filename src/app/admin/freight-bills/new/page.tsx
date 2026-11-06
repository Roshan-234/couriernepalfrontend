"use client";

/** A new freight bill. Saves as a draft and opens it for generating. */

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumbs, useToast } from "@/components/kit";
import { ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { FreightBillForm } from "@/components/admin/documents/FreightBillForm";
import { freightBills, type FreightBillWrite } from "@/lib/resources/documents";
import { errorMessage } from "@/lib/resources/client";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
  const router = useRouter();
  const toast = useToast();
  const cache = useQueryClient();
  const { user } = useAuth();

  const create = useMutation({
    mutationFn: (payload: FreightBillWrite) => freightBills.create(payload),
    onSuccess: async (bill) => {
      toast.success("Freight bill saved", { description: bill.invoice_number });
      await cache.invalidateQueries({ queryKey: queryKeys.freightBills.all });
      router.replace(`/admin/freight-bills/${bill.id}`);
    },
    onError: (cause: unknown) =>
      toast.error("Could not save the freight bill", {
        description: errorMessage(cause),
        duration: null,
      }),
  });

  return (
    <>
      <Breadcrumbs
        className="mb-4"
        items={[{ label: "Freight bills", href: "/admin/freight-bills" }, { label: "New" }]}
      />
      <ScreenHeader
        eyebrow="Documents"
        title="New freight bill"
        description="The bill number is assigned on save. Generate the Excel file from the saved record."
      />
      <FreightBillForm
        bill={null}
        isAdmin={Boolean(user?.is_admin)}
        busy={create.isPending}
        submitLabel="Save freight bill"
        onCancel={() => router.push("/admin/freight-bills")}
        onSubmit={(payload) => create.mutate(payload)}
      />
    </>
  );
}
