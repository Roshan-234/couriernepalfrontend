"use client";

/**
 * Editor for an email campaign.
 *
 * Editing the subject, preheader, body or audience withdraws an existing
 * approval — otherwise approval would mean nothing, because anyone could
 * approve a harmless draft and then rewrite it. The API does the
 * withdrawing; this form warns before the save so nobody is surprised by a
 * campaign that refuses to send an hour later.
 */

import { useEffect, useState } from "react";
import { Button, Checkbox, Drawer, Field, Input, Textarea } from "@/components/kit";
import {
  CONTACT_STATUSES,
  type Audience,
  type ContactStatus,
  type EmailCampaignDetail,
  type EmailCampaignWrite,
} from "@/lib/resources/marketing";
import { FormSection, UTC_HINT, fromLocalInput, parseCommaList, toLocalInput } from "./shared";

interface Form {
  code: string;
  name: string;
  subject: string;
  preheader: string;
  body_en: string;
  body_ne: string;
  utm_campaign: string;
  scheduled_for: string;
  audienceTags: string;
  audienceCountries: string;
  audienceStatuses: ContactStatus[];
}

const blank: Form = {
  code: "",
  name: "",
  subject: "",
  preheader: "",
  body_en: "",
  body_ne: "",
  utm_campaign: "",
  scheduled_for: "",
  audienceTags: "",
  audienceCountries: "",
  audienceStatuses: [],
};

function formFrom(campaign: EmailCampaignDetail): Form {
  const audience = campaign.audience ?? {};
  return {
    code: campaign.code,
    name: campaign.name,
    subject: campaign.subject,
    preheader: campaign.preheader ?? "",
    body_en: campaign.body_en ?? "",
    body_ne: campaign.body_ne ?? "",
    utm_campaign: campaign.utm_campaign ?? "",
    scheduled_for: toLocalInput(campaign.scheduled_for),
    audienceTags: (audience.tags ?? []).join(", "),
    audienceCountries: (audience.country ?? []).join(", "),
    audienceStatuses: audience.status ?? [],
  };
}

export interface EmailCampaignEditorProps {
  open: boolean;
  campaign: EmailCampaignDetail | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: EmailCampaignWrite) => void;
}

export function EmailCampaignEditor({
  open,
  campaign,
  saving,
  onClose,
  onSubmit,
}: EmailCampaignEditorProps) {
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
  if (!form.code.trim()) errors.code = "A code is required. Sending asks for it to be typed back.";
  if (!form.name.trim()) errors.name = "A name is required.";
  if (!form.subject.trim()) errors.subject = "A subject is required.";
  if (!form.body_en.trim() && !form.body_ne.trim()) {
    errors.body_en = "At least one body is required — a campaign with no body cannot be approved.";
  }
  for (const code of parseCommaList(form.audienceCountries)) {
    if (!/^[A-Za-z]{2}$/.test(code)) {
      errors.audienceCountries = `“${code}” is not a two-letter country code.`;
      break;
    }
  }
  const invalid = Object.keys(errors).length > 0;
  const show = (key: keyof Form) => (showErrors ? errors[key] : undefined);

  /** Whether this save would clear an approval the campaign already has. */
  const clearsApproval =
    Boolean(campaign?.is_approved) &&
    (form.subject !== campaign?.subject ||
      form.preheader !== (campaign?.preheader ?? "") ||
      form.body_en !== (campaign?.body_en ?? "") ||
      form.body_ne !== (campaign?.body_ne ?? "") ||
      form.audienceTags !== (campaign?.audience.tags ?? []).join(", ") ||
      form.audienceCountries !== (campaign?.audience.country ?? []).join(", ") ||
      form.audienceStatuses.join(",") !== (campaign?.audience.status ?? []).join(","));

  function submit() {
    setShowErrors(true);
    if (invalid) return;

    const audience: Audience = {};
    const tags = parseCommaList(form.audienceTags);
    if (tags.length) audience.tags = tags;
    const countries = parseCommaList(form.audienceCountries).map((code) => code.toUpperCase());
    if (countries.length) audience.country = countries;
    if (form.audienceStatuses.length) audience.status = form.audienceStatuses;

    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      subject: form.subject.trim(),
      preheader: form.preheader.trim() || null,
      body_en: form.body_en.trim() || null,
      body_ne: form.body_ne.trim() || null,
      utm_campaign: form.utm_campaign.trim() || null,
      scheduled_for: fromLocalInput(form.scheduled_for),
      audience,
    });
  }

  function toggleStatus(status: ContactStatus, checked: boolean) {
    setForm((current) => ({
      ...current,
      audienceStatuses: checked
        ? [...current.audienceStatuses, status]
        : current.audienceStatuses.filter((item) => item !== status),
    }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={campaign ? `Edit ${campaign.code}` : "New email campaign"}
      description="Drafting is not approving and not sending."
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
          <Button
            type="button"
            variant={clearsApproval ? "danger" : "primary"}
            onClick={submit}
            loading={saving}
          >
            {clearsApproval ? "Save and withdraw approval" : campaign ? "Save changes" : "Create draft"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-7">
        {clearsApproval && (
          <p
            role="alert"
            className="rounded-[0.75rem] border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900"
          >
            <strong>This save withdraws the approval.</strong> You have changed
            the subject, preheader, body or audience, so the approval on record
            no longer describes what would go out. The campaign goes back to
            unapproved and has to be approved again before it can send — which
            is the point: the approver has to have read the thing that is
            actually sent.
          </p>
        )}

        <FormSection title="Identity">
          <Field
            label="Code"
            required
            error={show("code")}
            hint="Typed back by hand to confirm a send, so make it short and unmistakable."
          >
            <Input
              value={form.code}
              maxLength={60}
              onChange={(event) => set("code", event.target.value)}
            />
          </Field>
          <Field label="Name" required error={show("name")} hint="Internal. Not shown to a recipient.">
            <Input
              value={form.name}
              maxLength={150}
              onChange={(event) => set("name", event.target.value)}
            />
          </Field>
          <Field label="UTM campaign" showOptional>
            <Input
              value={form.utm_campaign}
              maxLength={80}
              onChange={(event) => set("utm_campaign", event.target.value)}
            />
          </Field>
          <Field
            label="Scheduled for"
            showOptional
            hint={`A note of intent only — nothing sends it automatically. ${UTC_HINT}`}
          >
            <Input
              type="datetime-local"
              value={form.scheduled_for}
              onChange={(event) => set("scheduled_for", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection title="What goes out">
          <Field label="Subject" required error={show("subject")}>
            <Input
              value={form.subject}
              maxLength={200}
              onChange={(event) => set("subject", event.target.value)}
            />
          </Field>
          <Field label="Preheader" showOptional hint="The preview line after the subject in an inbox.">
            <Input
              value={form.preheader}
              maxLength={200}
              onChange={(event) => set("preheader", event.target.value)}
            />
          </Field>
          <Field
            label="Body (English)"
            error={show("body_en")}
            hint="Plain text. {name}, {email} and {unsubscribe_url} are filled in per recipient; an unsubscribe line is appended if you do not place one."
          >
            <Textarea
              rows={10}
              value={form.body_en}
              onChange={(event) => set("body_en", event.target.value)}
            />
          </Field>
          <Field
            label="Body (Nepali)"
            showOptional
            hint="Sent to contacts whose language is Nepali. Left empty, they get the English."
          >
            <Textarea
              rows={8}
              value={form.body_ne}
              lang="ne"
              onChange={(event) => set("body_ne", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Audience"
          description="Leave all three empty and the campaign goes to confirmed subscribers and nobody else. It never means “everyone in the table”."
        >
          <Field label="Tags" showOptional hint="Comma separated. A contact matching any one of them is included.">
            <Input
              value={form.audienceTags}
              placeholder="merchant, diaspora-uk"
              onChange={(event) => set("audienceTags", event.target.value)}
            />
          </Field>
          <Field
            label="Countries"
            showOptional
            error={show("audienceCountries")}
            hint="Two-letter codes, comma separated."
          >
            <Input
              value={form.audienceCountries}
              placeholder="NP, AE"
              onChange={(event) => set("audienceCountries", event.target.value)}
            />
          </Field>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold text-[color:var(--brand-navy)]">
              Contact statuses to include
            </legend>
            <p className="text-xs text-slate-600">
              Default is subscribed only. Adding another status does{" "}
              <strong>not</strong> mail those people — the send writes a skipped
              row for each, with the reason — it only makes them visible in the
              audience count and in the report.
            </p>
            {CONTACT_STATUSES.map((value) => (
              <Checkbox
                key={value}
                label={value}
                checked={form.audienceStatuses.includes(value)}
                onChange={(event) => toggleStatus(value, event.target.checked)}
              />
            ))}
          </fieldset>
        </FormSection>

        {campaign && (
          <p className="rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            This audience currently selects{" "}
            <strong>{campaign.audience_size}</strong> contact
            {campaign.audience_size === 1 ? "" : "s"}. That number is counted
            fresh each time the campaign is opened, and who is actually
            mailable is decided at send time — not now.
          </p>
        )}
      </div>
    </Drawer>
  );
}
