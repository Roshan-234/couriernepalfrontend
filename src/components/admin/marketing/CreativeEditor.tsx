"use client";

/**
 * Editor for one creative — the thing a visitor actually sees.
 *
 * Two rules are enforced here rather than left to surface as a 400:
 *
 * * **An image needs alt text.** The API refuses to activate a creative
 *   that carries an image and no `image_alt`, because the image is the
 *   offer rather than decoration. The field is therefore required the
 *   moment an image path is typed, and says why. It is *not* required to
 *   upload: `CreativeImageField` deliberately does not block on it, so
 *   sorting out artwork and writing copy can be separate sittings.
 * * **`target_path` and every entry in `page_paths` must be
 *   site-relative.** They end up inside an `href`, so `javascript:`,
 *   `data:`, absolute and protocol-relative values are all rejected.
 *
 * Every box here round-trips: the admin endpoint returns the stored
 * English, the stored Nepali, `page_paths` and `countries`, so the form
 * loads what is really in the database and an untouched save writes it
 * back unchanged. The path rules are re-checked against the loaded values
 * on open, not only against newly typed ones, so a creative that already
 * holds a bad path says so the moment it is opened.
 */

import { useEffect, useState } from "react";
import { Button, Drawer, Field, Input, Select, Textarea } from "@/components/kit";
import type {
  AdCreativeRow,
  AdPlacementRow,
  CreativeWrite,
} from "@/lib/resources/advertising";
import { AD_FORMATS } from "@/lib/resources/advertising";
import type { AdFormat } from "@/lib/resources/ads";
import { CreativeImageField } from "./CreativeImageField";
import {
  FormSection,
  PATH_HINT,
  PathListField,
  countryListProblem,
  parseCommaList,
  parsePathList,
  pathListProblem,
  sitePathProblem,
} from "./shared";

interface Form {
  placement_id: string;
  format: AdFormat;
  headline: string;
  body: string;
  call_to_action: string;
  target_path: string;
  image_path: string;
  image_alt: string;
  headline_ne: string;
  body_ne: string;
  page_paths: string;
  countries: string;
  priority: string;
}

const blank: Form = {
  placement_id: "",
  format: "banner",
  headline: "",
  body: "",
  call_to_action: "",
  target_path: "",
  image_path: "",
  image_alt: "",
  headline_ne: "",
  body_ne: "",
  page_paths: "",
  countries: "",
  priority: "0",
};

function formFrom(creative: AdCreativeRow): Form {
  return {
    placement_id: String(creative.placement_id),
    format: creative.format,
    // The stored English, because the admin endpoint does not resolve it.
    headline: creative.headline,
    body: creative.body ?? "",
    call_to_action: creative.call_to_action ?? "",
    target_path: creative.target_path ?? "",
    image_path: creative.image_path ?? "",
    image_alt: creative.image_alt ?? "",
    headline_ne: creative.headline_ne ?? "",
    body_ne: creative.body_ne ?? "",
    page_paths: (creative.page_paths ?? []).join("\n"),
    countries: (creative.countries ?? []).join(", "),
    priority: String(creative.priority ?? 0),
  };
}

export interface CreativeEditorProps {
  open: boolean;
  creative: AdCreativeRow | null;
  placements: AdPlacementRow[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: CreativeWrite) => void;
  /**
   * An image upload or removal is its own write, committed by the API
   * before this form is saved. This hands the returned creative back so
   * the list behind the drawer can be updated from it.
   */
  onImageChanged: (creative: AdCreativeRow) => void;
}

export function CreativeEditor({
  open,
  creative,
  placements,
  saving,
  onClose,
  onSubmit,
  onImageChanged,
}: CreativeEditorProps) {
  const [form, setForm] = useState<Form>(blank);
  const [showErrors, setShowErrors] = useState(false);
  /**
   * What the API currently holds in `image_path`, tracked separately from
   * the form because an upload changes it mid-edit. The `creative` prop
   * deliberately keeps its identity across an upload — replacing it would
   * re-run the effect below and throw away everything typed so far.
   */
  const [storedImage, setStoredImage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(creative ? formFrom(creative) : blank);
    setStoredImage(creative?.image_path ?? null);
    setShowErrors(false);
  }, [open, creative]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const placement = placements.find((item) => String(item.id) === form.placement_id) ?? null;

  const errors: Partial<Record<keyof Form, string>> = {};
  if (!form.placement_id) errors.placement_id = "Choose the slot this creative goes in.";
  if (!form.headline.trim()) errors.headline = "A headline is required.";
  const targetProblem = sitePathProblem(form.target_path);
  if (targetProblem) errors.target_path = targetProblem;
  if (form.image_path.trim() && !form.image_alt.trim()) {
    errors.image_alt =
      "Alt text is required once there is an image. The API refuses to activate a creative with an image and no alt text: the image carries the offer, so a screen-reader user with no alt text is simply not told there is one.";
  }
  const pathsProblem = pathListProblem(form.page_paths);
  if (pathsProblem) errors.page_paths = pathsProblem;
  const countriesProblem = countryListProblem(form.countries);
  if (countriesProblem) errors.countries = countriesProblem;
  if (!/^-?\d+$/.test(form.priority.trim())) errors.priority = "A whole number between -1000 and 1000.";

  const invalid = Object.keys(errors).length > 0;

  /**
   * A "you have not filled this in yet" error waits for a save attempt; a
   * "this value is not allowed" error does not, because it is just as true
   * of a value that arrived from the server as of one typed just now. That
   * is what surfaces a stored bad path when the creative is opened.
   */
  const ALWAYS_SHOWN: Array<keyof Form> = ["target_path", "page_paths", "countries"];
  const show = (key: keyof Form) =>
    showErrors || ALWAYS_SHOWN.includes(key) ? errors[key] : undefined;

  function submit() {
    setShowErrors(true);
    if (invalid) return;

    const body: CreativeWrite = {
      placement_id: Number(form.placement_id),
      format: form.format,
      headline: form.headline.trim(),
      body: form.body.trim() || null,
      call_to_action: form.call_to_action.trim() || null,
      target_path: form.target_path.trim() || null,
      image_path: form.image_path.trim() || null,
      image_alt: form.image_alt.trim() || null,
      priority: Number(form.priority),
      // Sent every time. The form was loaded from the stored values, so
      // writing them back unchanged is a no-op rather than a blanking.
      // An empty box means null, which is how the column is cleared.
      headline_ne: form.headline_ne.trim() || null,
      body_ne: form.body_ne.trim() || null,
      page_paths: parsePathList(form.page_paths),
      countries: parseCommaList(form.countries).map((code) => code.toUpperCase()),
    };
    onSubmit(body);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={creative ? `Edit “${creative.headline}”` : "New creative"}
      description={
        creative
          ? undefined
          : "A new creative is created active, so the alt-text rule applies at creation too."
      }
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
            {creative ? "Save changes" : "Add creative"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-7">
        <FormSection title="Slot">
          <Field label="Placement" required error={show("placement_id")}>
            <Select
              value={form.placement_id}
              onChange={(event) => set("placement_id", event.target.value)}
              options={[
                { value: "", label: "Choose a placement" },
                ...placements.map((item) => ({
                  value: String(item.id),
                  label: `${item.name} (${item.code})${item.is_active ? "" : " — inactive"}`,
                })),
              ]}
            />
          </Field>
          {placement && (
            <p className="rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {placement.description}{" "}
              {placement.recommended_width && placement.recommended_height ? (
                <>
                  Recommended image {placement.recommended_width}×
                  {placement.recommended_height}.{" "}
                </>
              ) : null}
              Holds {placement.max_creatives} creative
              {placement.max_creatives === 1 ? "" : "s"} at a time; above that, the
              highest priority wins and the rest are not served.
              {!placement.is_active && (
                <>
                  {" "}
                  <strong>This placement is inactive</strong>, so nothing in it is
                  served whatever the campaign does.
                </>
              )}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Format" hint="The shape the slot was designed around.">
              <Select
                value={form.format}
                onChange={(event) => set("format", event.target.value as AdFormat)}
                options={AD_FORMATS.map((value) => ({ value, label: value }))}
              />
            </Field>
            <Field
              label="Priority"
              error={show("priority")}
              hint="Higher wins when a slot is over capacity. -1000 to 1000."
            >
              <Input
                type="number"
                value={form.priority}
                onChange={(event) => set("priority", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="English copy" description="What a visitor reading in English sees.">
          <Field label="Headline" required error={show("headline")}>
            <Input
              value={form.headline}
              maxLength={150}
              onChange={(event) => set("headline", event.target.value)}
            />
          </Field>
          <Field label="Body" showOptional>
            <Textarea
              rows={3}
              value={form.body}
              maxLength={400}
              onChange={(event) => set("body", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Call to action" showOptional hint="The words on the link, e.g. “Get a Dashain quote”.">
              <Input
                value={form.call_to_action}
                maxLength={60}
                onChange={(event) => set("call_to_action", event.target.value)}
              />
            </Field>
            <Field
              label="Target path"
              showOptional
              error={show("target_path")}
              hint={PATH_HINT}
            >
              <Input
                value={form.target_path}
                maxLength={300}
                placeholder="/pricing"
                onChange={(event) => set("target_path", event.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Nepali copy"
          description="Shown to a visitor reading in Nepali. Left empty, the public side falls back to the English above — which is a deliberate state for several seeded creatives awaiting a native speaker, not an oversight."
        >
          <Field
            label="Headline (Nepali)"
            showOptional
            hint={creative && !creative.headline_ne ? "Not written yet." : undefined}
          >
            <Input
              value={form.headline_ne}
              maxLength={200}
              lang="ne"
              onChange={(event) => set("headline_ne", event.target.value)}
            />
          </Field>
          <Field
            label="Body (Nepali)"
            showOptional
            hint={creative && !creative.body_ne ? "Not written yet." : undefined}
          >
            <Textarea
              rows={3}
              value={form.body_ne}
              maxLength={500}
              lang="ne"
              onChange={(event) => set("body_ne", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Image"
          description="Optional — a text-only advert is a legitimate one. An uploaded file is stored on this site, re-encoded, and served from a permanent URL."
        >
          <CreativeImageField
            creativeId={creative?.id ?? null}
            storedPath={storedImage}
            value={form.image_path}
            alt={form.image_alt}
            disabled={saving}
            onChange={(value) => set("image_path", value)}
            onStored={(row) => {
              setStoredImage(row.image_path);
              onImageChanged(row);
            }}
          />
          <Field
            label="Alt text"
            required={Boolean(form.image_path.trim())}
            showOptional={!form.image_path.trim()}
            error={show("image_alt")}
            hint={
              form.image_path.trim()
                ? "Required: this creative cannot be activated without it. Uploading the file did not need it; going live does."
                : "Required as soon as there is an image."
            }
          >
            <Input
              value={form.image_alt}
              maxLength={200}
              onChange={(event) => set("image_alt", event.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Where it may appear"
          description="Both lists are loaded from what is stored, so clearing a box here clears the column on save."
        >
          <PathListField
            label="Page paths"
            value={form.page_paths}
            emptyMeans="Empty means anywhere the placement exists."
            onChange={(value) => set("page_paths", value)}
          />
          <Field
            label="Countries"
            showOptional
            error={show("countries")}
            hint="Two-letter codes, comma separated — NP, AE, GB. Geography is the only targeting there is; nothing here is based on a visitor's behaviour."
          >
            <Input
              value={form.countries}
              placeholder="NP, AE, GB"
              onChange={(event) => set("countries", event.target.value)}
            />
          </Field>
        </FormSection>
      </div>
    </Drawer>
  );
}
