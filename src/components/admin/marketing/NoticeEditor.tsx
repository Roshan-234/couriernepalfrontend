"use client";

/**
 * Editor for a site notice.
 *
 * There is no "active" switch in this form. The API would accept one on a
 * `PUT`, but putting an announcement in front of every visitor is not a
 * checkbox buried in a form — it is the Activate button on the list, with
 * its own confirmation. The same reasoning as the campaign lifecycle.
 *
 * `title_ne`, `body_ne` and `page_paths` round-trip: the admin read returns
 * the stored values rather than resolving a language, so the form loads
 * what is really there and an untouched save writes it back unchanged.
 */

import { useEffect, useState } from "react";
import { Button, Checkbox, Drawer, Field, Input, Select, Textarea } from "@/components/kit";
import type { NoticeStyle, NoticeTone } from "@/lib/resources/ads";
import {
  NOTICE_STYLES,
  NOTICE_TONES,
  type AdminNoticeRow,
  type NoticeWrite,
} from "@/lib/resources/advertising";
import {
  FormSection,
  PATH_HINT,
  PathListField,
  UTC_HINT,
  fromLocalInput,
  parsePathList,
  pathListProblem,
  sitePathProblem,
  toLocalInput,
} from "./shared";

const STYLE_MEANS: Record<NoticeStyle, string> = {
  bar: "A strip across the top of the page. The least intrusive of the three.",
  modal: "A dialog over the page. It interrupts; reserve it for something the visitor must act on.",
  toast: "A small card in the corner that does not block anything.",
};

const TONE_MEANS: Record<NoticeTone, string> = {
  info: "Something worth knowing — changed opening hours, a new service.",
  promotion: "An offer. Use a campaign creative instead where there is a slot for one.",
  warning: "Something that will affect a shipment if ignored — a cut-off date.",
  disruption: "Something already going wrong — a border closure, a strike.",
};

interface Form {
  code: string;
  title: string;
  body: string;
  title_ne: string;
  body_ne: string;
  style: NoticeStyle;
  tone: NoticeTone;
  link_path: string;
  link_label: string;
  starts_at: string;
  ends_at: string;
  page_paths: string;
  dismiss_days: string;
  max_impressions: string;
  is_dismissible: boolean;
  priority: string;
}

const blank: Form = {
  code: "",
  title: "",
  body: "",
  title_ne: "",
  body_ne: "",
  style: "bar",
  tone: "info",
  link_path: "",
  link_label: "",
  starts_at: "",
  ends_at: "",
  page_paths: "",
  dismiss_days: "30",
  max_impressions: "0",
  is_dismissible: true,
  priority: "0",
};

function formFrom(notice: AdminNoticeRow): Form {
  return {
    ...blank,
    code: notice.code,
    // Stored English, not a language-resolved value.
    title: notice.title,
    body: notice.body ?? "",
    title_ne: notice.title_ne ?? "",
    body_ne: notice.body_ne ?? "",
    page_paths: (notice.page_paths ?? []).join("\n"),
    style: notice.style,
    tone: notice.tone,
    link_path: notice.link_path ?? "",
    link_label: notice.link_label ?? "",
    starts_at: toLocalInput(notice.starts_at),
    ends_at: toLocalInput(notice.ends_at),
    dismiss_days: String(notice.dismiss_days ?? 0),
    max_impressions: String(notice.max_impressions ?? 0),
    is_dismissible: notice.is_dismissible,
    priority: String(notice.priority ?? 0),
  };
}

export interface NoticeEditorProps {
  open: boolean;
  notice: AdminNoticeRow | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: NoticeWrite) => void;
}

export function NoticeEditor({ open, notice, saving, onClose, onSubmit }: NoticeEditorProps) {
  const [form, setForm] = useState<Form>(blank);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(notice ? formFrom(notice) : blank);
    setShowErrors(false);
  }, [open, notice]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const errors: Partial<Record<keyof Form, string>> = {};
  if (!form.code.trim()) errors.code = "A code is required; the browser remembers a dismissal by it.";
  if (!form.title.trim()) errors.title = "A title is required.";
  const linkProblem = sitePathProblem(form.link_path);
  if (linkProblem) errors.link_path = linkProblem;
  const pathsProblem = pathListProblem(form.page_paths);
  if (pathsProblem) errors.page_paths = pathsProblem;
  if (form.starts_at && form.ends_at && form.ends_at <= form.starts_at) {
    errors.ends_at = "The end has to be after the start.";
  }
  if (!/^\d+$/.test(form.dismiss_days.trim()) || Number(form.dismiss_days) > 3650) {
    errors.dismiss_days = "A whole number of days, 0 to 3650.";
  }
  if (!/^\d+$/.test(form.max_impressions.trim()) || Number(form.max_impressions) > 1000) {
    errors.max_impressions = "A whole number, 0 to 1000.";
  }
  if (!/^-?\d+$/.test(form.priority.trim())) errors.priority = "A whole number between -1000 and 1000.";

  const invalid = Object.keys(errors).length > 0;
  /**
   * A missing required field waits for a save attempt; a value the API
   * would reject does not, since that is equally true of something loaded
   * from the server. That is what flags a stored bad path on open.
   */
  const ALWAYS_SHOWN: Array<keyof Form> = ["link_path", "page_paths"];
  const show = (key: keyof Form) =>
    showErrors || ALWAYS_SHOWN.includes(key) ? errors[key] : undefined;

  function submit() {
    setShowErrors(true);
    if (invalid) return;
    const body: NoticeWrite = {
      code: form.code.trim(),
      title: form.title.trim(),
      body: form.body.trim() || null,
      style: form.style,
      tone: form.tone,
      link_path: form.link_path.trim() || null,
      link_label: form.link_label.trim() || null,
      starts_at: fromLocalInput(form.starts_at),
      ends_at: fromLocalInput(form.ends_at),
      dismiss_days: Number(form.dismiss_days),
      max_impressions: Number(form.max_impressions),
      is_dismissible: form.is_dismissible,
      priority: Number(form.priority),
      // Sent every time: the form holds what was stored, so writing it
      // back is a no-op. An empty box means null, which clears the column.
      title_ne: form.title_ne.trim() || null,
      body_ne: form.body_ne.trim() || null,
      page_paths: parsePathList(form.page_paths),
    };
    onSubmit(body);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={notice ? `Edit ${notice.code}` : "New notice"}
      description="A new notice is created inactive. Activating it is a separate, confirmed action."
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
            {notice ? "Save changes" : "Create notice"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-7">
        <FormSection title="Identity">
          <Field
            label="Code"
            required
            error={show("code")}
            hint="Unique. A visitor's browser remembers a dismissal against this code, so changing it on a live notice shows it again to everyone who dismissed it."
          >
            <Input
              value={form.code}
              maxLength={60}
              onChange={(event) => set("code", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Style" hint={STYLE_MEANS[form.style]}>
              <Select
                value={form.style}
                onChange={(event) => set("style", event.target.value as NoticeStyle)}
                options={NOTICE_STYLES.map((value) => ({ value, label: value }))}
              />
            </Field>
            <Field label="Tone" hint={TONE_MEANS[form.tone]}>
              <Select
                value={form.tone}
                onChange={(event) => set("tone", event.target.value as NoticeTone)}
                options={NOTICE_TONES.map((value) => ({ value, label: value }))}
              />
            </Field>
          </div>
          <Field
            label="Priority"
            error={show("priority")}
            hint="Higher is shown first when more than one notice matches a page."
          >
            <Input
              type="number"
              value={form.priority}
              onChange={(event) => set("priority", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection title="English copy">
          <Field label="Title" required error={show("title")}>
            <Input
              value={form.title}
              maxLength={150}
              onChange={(event) => set("title", event.target.value)}
            />
          </Field>
          <Field label="Body" showOptional>
            <Textarea
              rows={4}
              value={form.body}
              onChange={(event) => set("body", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Nepali copy"
          description="Left empty, a visitor reading in Nepali sees the English above."
        >
          <Field
            label="Title (Nepali)"
            showOptional
            hint={notice && !notice.title_ne ? "Not written yet." : undefined}
          >
            <Input
              value={form.title_ne}
              maxLength={200}
              lang="ne"
              onChange={(event) => set("title_ne", event.target.value)}
            />
          </Field>
          <Field
            label="Body (Nepali)"
            showOptional
            hint={notice && !notice.body_ne ? "Not written yet." : undefined}
          >
            <Textarea
              rows={4}
              value={form.body_ne}
              lang="ne"
              onChange={(event) => set("body_ne", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection title="Link">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Link path" showOptional error={show("link_path")} hint={PATH_HINT}>
              <Input
                value={form.link_path}
                maxLength={300}
                placeholder="/contact"
                onChange={(event) => set("link_path", event.target.value)}
              />
            </Field>
            <Field label="Link label" showOptional hint="The words on the link.">
              <Input
                value={form.link_label}
                maxLength={60}
                onChange={(event) => set("link_label", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Where and when" description={UTC_HINT}>
          <PathListField
            label="Page paths"
            value={form.page_paths}
            emptyMeans="Empty means every page."
            onChange={(value) => set("page_paths", value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" showOptional>
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

        <FormSection
          title="How often a visitor sees it"
          description="A notice that reappears on every page is how people learn to ignore them."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Dismissal sticks for (days)"
              error={show("dismiss_days")}
              hint="0 means for the rest of the browsing session only. A visitor who refused preferences cookies always gets the session-only behaviour."
            >
              <Input
                type="number"
                value={form.dismiss_days}
                onChange={(event) => set("dismiss_days", event.target.value)}
              />
            </Field>
            <Field
              label="Maximum impressions"
              error={show("max_impressions")}
              hint="Per visitor. 0 means no cap. Honoured only as far as the browser's available storage allows."
            >
              <Input
                type="number"
                value={form.max_impressions}
                onChange={(event) => set("max_impressions", event.target.value)}
              />
            </Field>
          </div>
          <Checkbox
            label="Visitors may dismiss it"
            hint="Switch off only for something unmissable — a disruption people have to read. An undismissible notice follows them across every page."
            checked={form.is_dismissible}
            onChange={(event) => set("is_dismissible", event.target.checked)}
          />
        </FormSection>
      </div>
    </Drawer>
  );
}
