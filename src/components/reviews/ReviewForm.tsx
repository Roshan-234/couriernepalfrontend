"use client";

/**
 * The review form.
 *
 * Two things govern how this behaves, and both go against the convenient
 * pattern:
 *
 * **It says plainly that a person reads the review first.** The API answers
 * 202 whatever happens and never echoes the review back, because an endpoint
 * that confirmed storage would be a way to test whether spam landed. So
 * there is nothing to render into the list, and nothing is: no optimistic
 * row, no "your review is now live". The acknowledgement says it has been
 * sent to the team, which is the whole of what we know.
 *
 * **The tracking number is optional and its failure is silent.** A valid one
 * earns the verified badge; an invalid one is accepted without comment and
 * simply does not verify, which is what stops the field being used to probe
 * which tracking numbers exist. The wording therefore promises nothing and
 * never reports the number as wrong.
 */

import { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FaStar } from "react-icons/fa";
import { Button, Field, Input, Textarea } from "@/components/kit";
import { errorMessage } from "@/lib/api";
import { statusOf } from "@/lib/resources/client";
import { reviews, type ReviewSubmission } from "@/lib/resources/reviews";
import { cn } from "@/lib/utils";

/** The API refuses anything shorter, so the form says so before it is sent. */
const MIN_BODY = 10;
const MAX_BODY = 4000;

const RATING_MEANS: Record<number, string> = {
  1: "Poor",
  2: "Not good",
  3: "Mixed",
  4: "Good",
  5: "Excellent",
};

interface FormState {
  rating: number;
  title: string;
  body: string;
  author_name: string;
  author_email: string;
  tracking_no: string;
}

const blank: FormState = {
  rating: 0,
  title: "",
  body: "",
  author_name: "",
  author_email: "",
  tracking_no: "",
};

export interface ReviewFormProps {
  className?: string;
}

export function ReviewForm({ className }: ReviewFormProps) {
  const headingId = useId();
  const ratingErrorId = useId();
  const [form, setForm] = useState<FormState>(blank);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const ratingProblem = form.rating === 0 ? "Choose a rating from 1 to 5 stars." : null;
  const bodyProblem =
    form.body.trim().length === 0
      ? "Tell us how it went."
      : form.body.trim().length < MIN_BODY
        ? `A little more than that — at least ${MIN_BODY} characters.`
        : null;
  const nameProblem = form.author_name.trim().length === 0 ? "Tell us what to call you." : null;

  const submit = useMutation({
    mutationFn: (body: ReviewSubmission) => reviews.submit(body),
    onSuccess: (receipt) => {
      // Deliberately *not* added to any list and no cache invalidated: the
      // review is pending and is not in the public collection.
      setSent(receipt.message);
      setForm(blank);
      setTouched(false);
    },
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (ratingProblem || bodyProblem || nameProblem) return;

    const trimmedTitle = form.title.trim();
    const trimmedEmail = form.author_email.trim();
    const trimmedTracking = form.tracking_no.trim();

    submit.mutate({
      rating: form.rating,
      body: form.body.trim(),
      author_name: form.author_name.trim(),
      ...(trimmedTitle ? { title: trimmedTitle } : {}),
      ...(trimmedEmail ? { author_email: trimmedEmail } : {}),
      ...(trimmedTracking ? { tracking_no: trimmedTracking } : {}),
    });
  }

  const failure = submit.isError
    ? statusOf(submit.error) === 429
      ? "That is as many reviews as this connection can send in an hour. Please try again later."
      : errorMessage(submit.error, "Your review could not be sent. Please try again.")
    : null;

  if (sent) {
    return (
      <section
        className={cn("panel", className)}
        aria-labelledby={headingId}
        // The outcome replaces the form, so a screen reader following the
        // page order lands on it rather than being told from elsewhere.
        aria-live="polite"
      >
        <h2 id={headingId} className="text-xl font-bold text-[color:var(--brand-navy)]">
          Thank you — it has been sent
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">{sent}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          It is not on the page yet. Somebody at the office reads every review
          before it is published, so there will be a wait — and you will not
          see it in the list below until then.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => setSent(null)}>
          Write another review
        </Button>
      </section>
    );
  }

  return (
    <section className={cn("panel", className)} aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xl font-bold text-[color:var(--brand-navy)]">
        Write a review
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        If you have shipped with us, we would like to hear how it went — a
        problem as much as a good run. <strong>Every review is read by our
        team before it appears on the site</strong>, so yours will not show up
        straight away.
      </p>

      <form className="mt-6 grid gap-5" onSubmit={onSubmit} noValidate>
        {/* ── Rating ───────────────────────────────────────────────────
            A radio group rather than a row of buttons, so arrow keys move
            through it and the choice is announced as "3 of 5". */}
        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">
            Your rating <span className="text-red-700">*</span>
          </legend>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = form.rating >= star;
              return (
                <label
                  key={star}
                  className={cn(
                    "flex min-h-11 w-11 cursor-pointer items-center justify-center rounded-[0.5rem]",
                    "hover:bg-slate-100 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                    "has-[:focus-visible]:outline-[color:var(--brand-teal)]",
                  )}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={form.rating === star}
                    onChange={() => set("rating", star)}
                    className="sr-only"
                    aria-describedby={touched && ratingProblem ? ratingErrorId : undefined}
                  />
                  <span className="sr-only">
                    {star} star{star === 1 ? "" : "s"} — {RATING_MEANS[star]}
                  </span>
                  <FaStar
                    aria-hidden="true"
                    className={cn(
                      "text-2xl",
                      active ? "text-[color:var(--brand-yellow)]" : "text-slate-300",
                    )}
                  />
                </label>
              );
            })}
            {form.rating > 0 && (
              <span className="ml-2 text-sm text-slate-700">{RATING_MEANS[form.rating]}</span>
            )}
          </div>
          {touched && ratingProblem && (
            <p id={ratingErrorId} className="mt-2 text-xs font-semibold text-red-700">
              {ratingProblem}
            </p>
          )}
        </fieldset>

        <Field label="A short headline" hint="One line summing it up." showOptional>
          <Input
            value={form.title}
            maxLength={150}
            onChange={(event) => set("title", event.target.value)}
            placeholder="e.g. Parcel reached London in five days"
          />
        </Field>

        <Field
          label="Your review"
          required
          error={touched ? bodyProblem : null}
          hint="What you sent, where it went, and how it went."
        >
          <Textarea
            rows={6}
            value={form.body}
            maxLength={MAX_BODY}
            onChange={(event) => set("body", event.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Your name"
            required
            error={touched ? nameProblem : null}
            hint="Shown on the site. A first name and an initial is plenty."
          >
            <Input
              value={form.author_name}
              maxLength={120}
              autoComplete="name"
              onChange={(event) => set("author_name", event.target.value)}
            />
          </Field>

          <Field
            label="Your email"
            showOptional
            hint="Never published. Only so the office can reply to you directly."
          >
            <Input
              type="email"
              value={form.author_email}
              maxLength={200}
              autoComplete="email"
              onChange={(event) => set("author_email", event.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Tracking number"
          showOptional
          hint="If you still have it, adding it lets us match the review to your shipment. Leave it blank if you do not — the review is published either way."
        >
          <Input
            value={form.tracking_no}
            maxLength={100}
            onChange={(event) => set("tracking_no", event.target.value)}
            placeholder="e.g. MNL4F2A9C1B7"
          />
        </Field>

        {failure && (
          <p
            role="alert"
            className="rounded-[0.75rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            {failure}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" loading={submit.isPending} loadingLabel="Sending…">
            Send for review
          </Button>
          <p className="text-xs text-slate-600">
            Read by our team before it appears. Nothing is published automatically.
          </p>
        </div>
      </form>
    </section>
  );
}
