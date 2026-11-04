"use client";

/**
 * Editor for an advert campaign.
 *
 * There is no status control, and that is the point: the API answers a
 * `PUT` carrying `status` with a 400 naming the lifecycle endpoints, so
 * offering a dropdown here would be offering an action that cannot work.
 * Going live is a button on the list, with its own confirmation.
 */

import { useEffect, useState } from "react";
import { Button, Drawer, Field, Input, Textarea } from "@/components/kit";
import type { AdCampaignRow, CampaignWrite } from "@/lib/resources/advertising";
import {
  FormSection,
  PATH_HINT,
  UTC_HINT,
  fromLocalInput,
  sitePathProblem,
  toLocalInput,
} from "./shared";

interface Form {
  code: string;
  name: string;
  objective: string;
  occasion: string;
  utm_campaign: string;
  landing_path: string;
  starts_at: string;
  ends_at: string;
}

const blank: Form = {
  code: "",
  name: "",
  objective: "",
  occasion: "",
  utm_campaign: "",
  landing_path: "",
  starts_at: "",
  ends_at: "",
};

function formFrom(campaign: AdCampaignRow): Form {
  return {
    code: campaign.code,
    name: campaign.name,
    objective: campaign.objective ?? "",
    occasion: campaign.occasion ?? "",
    utm_campaign: campaign.utm_campaign ?? "",
    landing_path: campaign.landing_path ?? "",
    starts_at: toLocalInput(campaign.starts_at),
    ends_at: toLocalInput(campaign.ends_at),
  };
}

export interface AdCampaignEditorProps {
  open: boolean;
  campaign: AdCampaignRow | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: CampaignWrite) => void;
}

export function AdCampaignEditor({
  open,
  campaign,
  saving,
  onClose,
  onSubmit,
}: AdCampaignEditorProps) {
  const [form, setForm] = useState<Form>(blank);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(campaign ? formFrom(campaign) : blank);
    setShowErrors(false);
  }, [open, campaign]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const errors: Partial<Record<keyof Form, string>> = {};
  if (!form.code.trim()) errors.code = "A code is required; it has to be unique across campaigns.";
  if (!form.name.trim()) errors.name = "A name is required.";
  const landingProblem = sitePathProblem(form.landing_path);
  if (landingProblem) errors.landing_path = landingProblem;
  if (form.starts_at && form.ends_at && form.ends_at <= form.starts_at) {
    errors.ends_at = "The end has to be after the start.";
  }
  const invalid = Object.keys(errors).length > 0;
  const show = (key: keyof Form) => (showErrors ? errors[key] : undefined);

  function submit() {
    setShowErrors(true);
    if (invalid) return;
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      objective: form.objective.trim() || null,
      occasion: form.occasion.trim() || null,
      utm_campaign: form.utm_campaign.trim() || null,
      landing_path: form.landing_path.trim() || null,
      starts_at: fromLocalInput(form.starts_at),
      ends_at: fromLocalInput(form.ends_at),
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={campaign ? `Edit ${campaign.name}` : "New campaign"}
      description="A new campaign is a draft and serves nothing until it is activated."
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-3">
          {showErrors && invalid && (
            <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
              Fix the highlighted fields first.
            </p>
          )}
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} loading={saving}>
            {campaign ? "Save changes" : "Create draft"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-7">
        <FormSection
          title="Identity"
          description="The code is how this campaign is referred to in reports and in an email campaign's attribution."
        >
          <Field label="Code" required error={show("code")} hint="Short, stable, upper case by convention — DASHAIN_GIFT_CARGO.">
            <Input
              value={form.code}
              maxLength={60}
              onChange={(event) => set("code", event.target.value)}
            />
          </Field>
          <Field label="Name" required error={show("name")}>
            <Input
              value={form.name}
              maxLength={150}
              onChange={(event) => set("name", event.target.value)}
            />
          </Field>
          <Field
            label="Objective"
            showOptional
            hint="Who this is aimed at and what it is for. Read by whoever picks it up next season."
          >
            <Textarea
              rows={3}
              value={form.objective}
              maxLength={255}
              onChange={(event) => set("objective", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Occasion"
              showOptional
              hint="Festival or season — dashain, tihar, losar, student_season. Used as a filter."
            >
              <Input
                value={form.occasion}
                maxLength={60}
                onChange={(event) => set("occasion", event.target.value)}
              />
            </Field>
            <Field label="UTM campaign" showOptional hint="Appended to the landing link for attribution.">
              <Input
                value={form.utm_campaign}
                maxLength={80}
                onChange={(event) => set("utm_campaign", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Destination">
          <Field
            label="Landing path"
            showOptional
            error={show("landing_path")}
            hint={PATH_HINT}
          >
            <Input
              value={form.landing_path}
              maxLength={300}
              placeholder="/pricing"
              onChange={(event) => set("landing_path", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Window"
          description={`Leave both empty for a campaign with no dates: it then runs from the moment it is activated until it is paused or finished. ${UTC_HINT}`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" showOptional hint="Activating before this date leaves the campaign scheduled, not running.">
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) => set("starts_at", event.target.value)}
              />
            </Field>
            <Field label="Ends" showOptional error={show("ends_at")}>
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(event) => set("ends_at", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <p className="rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Status is not editable here. A campaign moves between draft,
          scheduled, running, paused and finished through the Activate, Pause
          and Finish buttons on the list — the API refuses a status sent with
          a save, so a dropdown would be a lie.
        </p>
      </div>
    </Drawer>
  );
}
