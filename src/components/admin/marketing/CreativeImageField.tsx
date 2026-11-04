"use client";

/**
 * The image on one creative: what is there now, a way to replace it and a
 * way to take it away.
 *
 * Three things about the endpoint shape this control:
 *
 * * **An upload is its own write.** `POST /creatives/<id>/image` sets
 *   `image_path` the moment it succeeds, before anybody presses Save, and
 *   a creative that does not exist yet has no id to post to. So the
 *   control says so out loud, and a new creative gets the URL box only.
 * * **The rules are stated before a file is chosen.** Format, size and
 *   dimensions are all refused server-side with a useful message, but
 *   reading the rule beforehand is better than discovering it by failing.
 * * **An over-sized body is a 413 with no JSON in it.** `MAX_CONTENT_LENGTH`
 *   is applied before the handler runs, so that one case is named by
 *   `imageUploadProblem` rather than left as an unexplained failure.
 *
 * The preview takes the creative's `image_alt` when there is one. When
 * there is not, it is given an explicitly empty alt and a visible caption:
 * inventing a description would be worse than none, and the caption tells
 * a screen-reader user both that an image is there and that it is the
 * thing stopping the creative being activated.
 */

import { useRef, useState } from "react";
import { Button, Field, Input, Spinner } from "@/components/kit";
import {
  CREATIVE_IMAGE_RULES,
  adCreatives,
  imageUploadProblem,
  isManagedImage,
  type AdCreativeRow,
} from "@/lib/resources/advertising";

export interface CreativeImageFieldProps {
  /** Null while the creative is still being created — there is nothing to post to. */
  creativeId: number | null;
  /** What the server currently has, so Remove knows whether there is a file to delete. */
  storedPath: string | null;
  /** The form's `image_path`, which may be a hand-typed value not yet saved. */
  value: string;
  /** The form's `image_alt`, used as the preview's alt text. */
  alt: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  /** Called with the creative the API returned after an upload or a removal. */
  onStored: (creative: AdCreativeRow) => void;
}

const MEGABYTE = 1024 * 1024;

/** Why this file would be refused locally, or null to let the server judge. */
function localProblem(file: File): string | null {
  if (file.size > CREATIVE_IMAGE_RULES.maxBytes) {
    return `That file is ${(file.size / MEGABYTE).toFixed(1)} MB, over the ${
      CREATIVE_IMAGE_RULES.maxBytes / MEGABYTE
    } MB limit. Export it smaller, or save it as a JPEG or WebP rather than a PNG.`;
  }
  // An empty `type` is left to the server: the browser not recognising a
  // file does not mean Pillow will not. A type it *does* recognise and we
  // do not accept is worth refusing here rather than after a round trip.
  if (file.type && !CREATIVE_IMAGE_RULES.accept.split(",").includes(file.type)) {
    return file.type === "image/svg+xml"
      ? "SVG is refused: it is a document that can carry script, not a bitmap. Export it as a PNG or WebP first."
      : `That file is ${file.type}. Only ${CREATIVE_IMAGE_RULES.formats} are accepted.`;
  }
  return null;
}

export function CreativeImageField({
  creativeId,
  storedPath,
  value,
  alt,
  disabled = false,
  onChange,
  onStored,
}: CreativeImageFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [byHand, setByHand] = useState(() => Boolean(value) && !isManagedImage(value));

  const trimmed = value.trim();
  // Remove only calls the API when the server is actually holding something.
  // A URL typed into the box and not yet saved is cleared locally instead,
  // because deleting the stored image is not what "clear this box" means.
  const removable = Boolean(storedPath) && trimmed === (storedPath ?? "");

  async function upload(file: File) {
    if (creativeId === null) return;
    const refusal = localProblem(file);
    if (refusal) {
      setProblem(refusal);
      setNote(null);
      return;
    }
    setBusy("upload");
    setProblem(null);
    setNote(null);
    try {
      const result = await adCreatives.uploadImage(creativeId, file);
      onChange(result.image.url);
      onStored(result.creative);
      setByHand(false);
      setNote(
        `${result.note} Stored as ${result.image.width}×${result.image.height} ${result.image.content_type
          .replace("image/", "")
          .toUpperCase()}.`,
      );
    } catch (error) {
      setProblem(imageUploadProblem(error));
    } finally {
      setBusy(null);
      // Let the same file be chosen again after a failure.
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setProblem(null);
    setNote(null);
    if (!removable || creativeId === null) {
      onChange("");
      return;
    }
    setBusy("remove");
    try {
      const creative = await adCreatives.removeImage(creativeId);
      onChange("");
      onStored(creative);
      setNote("Image removed. A text-only creative is a legitimate advert.");
    } catch (error) {
      setProblem(imageUploadProblem(error));
    } finally {
      setBusy(null);
    }
  }

  const working = busy !== null || disabled;

  return (
    <div className="space-y-3">
      {trimmed && (
        <div className="flex flex-wrap items-start gap-4 rounded-[0.75rem] border border-slate-200 bg-slate-50 p-3">
          {/* `next/image` would need every possible CDN origin declared in
              next.config.ts ahead of time; the public AdSlot renders these
              the same way for the same reason. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trimmed}
            alt={alt.trim() || ""}
            className="h-24 w-auto max-w-[12rem] rounded-[0.5rem] border border-slate-300 bg-white object-contain"
          />
          <div className="min-w-[12rem] flex-1 space-y-1 text-xs text-slate-700">
            {alt.trim() ? (
              <p>
                Described to a screen reader as “{alt.trim()}”.
              </p>
            ) : (
              <p className="font-semibold text-red-700">
                Image with no alt text. It is hidden from screen readers until
                one is written, and the creative cannot be activated.
              </p>
            )}
            <p className="break-all">
              <code>{trimmed}</code>
            </p>
            <p>
              {isManagedImage(trimmed)
                ? "Stored on this site, re-encoded, cached permanently at that URL."
                : "Loaded from somewhere else — this site does not control it."}
            </p>
          </div>
        </div>
      )}

      {creativeId === null ? (
        <p className="rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Uploading needs a creative to attach the file to. Add this one
          first, then reopen it to upload an image — or give a URL below.
        </p>
      ) : (
        <Field
          label="Upload an image"
          hint={`${CREATIVE_IMAGE_RULES.formats}, up to ${
            CREATIVE_IMAGE_RULES.maxBytes / MEGABYTE
          } MB, between ${CREATIVE_IMAGE_RULES.minEdge}px and ${
            CREATIVE_IMAGE_RULES.maxEdge
          }px on each edge. The file is re-encoded here and its camera metadata dropped, so a phone photo does not publish the GPS coordinates it was taken at — which is also why the stored file is not byte-for-byte the one you picked. Choosing a file uploads it straight away, before you save.`}
        >
          {(aria) => (
            <div className="flex flex-wrap items-center gap-3">
              <input
                {...aria}
                ref={input}
                type="file"
                accept={CREATIVE_IMAGE_RULES.accept}
                disabled={working}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
                className="max-w-full text-sm text-slate-700 file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-[0.65rem] file:border file:border-slate-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--brand-navy)] hover:file:bg-slate-100 disabled:opacity-60"
              />
              {busy === "upload" && (
                <span className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <Spinner size="sm" /> Uploading…
                </span>
              )}
            </div>
          )}
        </Field>
      )}

      {trimmed && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void remove()}
            loading={busy === "remove"}
            disabled={working}
          >
            {removable ? "Remove image" : "Clear"}
          </Button>
          <p className="text-xs text-slate-600">
            {removable
              ? "Deletes the stored file immediately, leaving a text-only creative."
              : "Empties the box. Nothing is deleted until you save."}
          </p>
        </div>
      )}

      {problem && (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {problem}
        </p>
      )}
      {note && !problem && (
        <p role="status" className="text-xs font-semibold text-teal-800">
          {note}
        </p>
      )}

      {byHand ? (
        <Field
          label="Image URL"
          showOptional
          hint="An image hosted somewhere else — a CDN, say. Uploading replaces whatever is here, and an uploaded file is not deleted by overwriting this box by hand."
        >
          <Input
            value={value}
            maxLength={500}
            placeholder="https://cdn.example.com/offers/dashain-hero.jpg"
            disabled={working}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      ) : (
        <Button type="button" variant="link" size="sm" onClick={() => setByHand(true)}>
          Use an image hosted elsewhere instead
        </Button>
      )}
    </div>
  );
}

export default CreativeImageField;
