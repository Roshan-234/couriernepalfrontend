"use client";

/**
 * Review moderation.
 *
 * Nothing a customer writes reaches the public site until somebody here
 * approves it, so this screen is the publishing decision itself rather than
 * a list with buttons on it. Three things follow from that and are worth
 * stating, because each of them cost a convenience:
 *
 * **The pending queue is the screen.** It opens on `pending` rather than on
 * everything, because the only question this page exists to answer is what
 * is waiting. Approved and rejected are tabs you go and look at.
 *
 * **Demo rows are marked and cannot be approved.** The API answers 409 for
 * one, and the approve button is disabled here with the reason on the row,
 * so nobody has to press it to find out. They are seeded examples: counting
 * them towards a rating would be inventing a reputation.
 *
 * **Approving publishes immediately**, so it is confirmed, and the reply box
 * is in that same dialog — a complaint is usually worth answering as it is
 * published rather than in a second pass nobody comes back for.
 *
 * The Google refresh button is deliberate and manual: the Places API bills
 * per call, so it is never fired on a page view and the last-fetched time is
 * shown beside it.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  Pagination,
  StatCard,
  Tabs,
  Textarea,
  useToast,
} from "@/components/kit";
import { Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { Stars, countryName, reviewMoment, starLabel } from "@/components/reviews/shared";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import {
  GOOGLE_REFRESH_REASONS,
  googleReviews,
  reviewsAdmin,
  type AdminReview,
  type ReviewStatus,
} from "@/lib/resources/reviews";

const PER_PAGE = 20;

const TABS: { id: ReviewStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Published" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "Everything" },
];

const STATUS_TONES: Record<ReviewStatus, "amber" | "green" | "neutral"> = {
  pending: "amber",
  approved: "green",
  rejected: "neutral",
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Awaiting moderation",
  approved: "Published",
  rejected: "Rejected",
};

/** One review, expanded. A table would hide the text, which is the content. */
function ReviewRow({
  review,
  canDelete,
  busy,
  onApprove,
  onReject,
  onReply,
  onDelete,
}: {
  review: AdminReview;
  canDelete: boolean;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReply: () => void;
  onDelete: () => void;
}) {
  const country = countryName(review.author_country);

  return (
    <article
      className={
        review.is_demo
          ? "rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 p-5"
          : "rounded-[1rem] border border-slate-200 bg-white p-5"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Stars value={review.rating} label={starLabel(review.rating)} />
        <Badge tone={STATUS_TONES[review.status]} variant="soft" size="sm">
          {STATUS_LABELS[review.status]}
        </Badge>
        {review.is_demo && (
          <Badge tone="neutral" variant="outline" size="sm">
            Seeded demo
          </Badge>
        )}
        {review.is_verified_customer && (
          <Badge tone="teal" variant="soft" size="sm">
            Verified customer
          </Badge>
        )}
        <span className="ml-auto text-xs text-slate-600">#{review.id}</span>
      </div>

      {review.title && (
        <h3 className="mt-3 text-base font-bold text-[color:var(--brand-navy)]">
          {review.title}
        </h3>
      )}
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{review.body}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-1 text-xs text-slate-600 sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="font-semibold text-slate-700">Written by</dt>
          <dd>
            {review.author_name}
            {country && <> · {country}</>}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-slate-700">Received</dt>
          <dd>{reviewMoment(review.created_at)}</dd>
        </div>
        {review.author_email && (
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-700">Email</dt>
            <dd className="break-all">{review.author_email}</dd>
          </div>
        )}
        {review.shipment_id !== null && (
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-700">Shipment</dt>
            <dd>#{review.shipment_id}</dd>
          </div>
        )}
        {review.moderated_at && (
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-700">Moderated</dt>
            <dd>{reviewMoment(review.moderated_at)}</dd>
          </div>
        )}
      </dl>

      {review.moderation_note && (
        <p className="mt-3 rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <strong>Internal note (never shown publicly):</strong> {review.moderation_note}
        </p>
      )}

      {review.reply_body && (
        <div className="mt-4 rounded-[0.75rem] border-l-4 border-[color:var(--brand-teal)] bg-teal-50/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">
            Our public reply · {reviewMoment(review.reply_at)}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-7 text-teal-950">
            {review.reply_body}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {review.status !== "approved" && (
          <Button
            size="sm"
            disabled={review.is_demo || busy}
            onClick={onApprove}
            // Spelled out rather than left to a tooltip: a disabled button
            // with no reason is the thing people file a bug about.
            title={review.is_demo ? "Seeded demo reviews are never published" : undefined}
          >
            Approve and publish
          </Button>
        )}
        {review.status !== "rejected" && (
          <Button variant="outline" size="sm" disabled={busy} onClick={onReject}>
            Reject
          </Button>
        )}
        <Button variant="ghost" size="sm" disabled={busy} onClick={onReply}>
          {review.reply_body ? "Edit reply" : "Write a reply"}
        </Button>
        {canDelete && (
          <Button variant="ghost" size="sm" disabled={busy} onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>

      {review.is_demo && (
        <p className="mt-3 text-xs text-slate-600">
          Seeded example content. It is invisible to the public API and cannot
          be approved — it exists so these screens can be read before there are
          real reviews.
        </p>
      )}
    </article>
  );
}

export default function Page() {
  const cache = useQueryClient();
  const { user } = useAuth();
  const { success, error: errorToast } = useToast();

  const canDelete = Boolean(user?.roles.includes("super_admin"));

  const [tab, setTab] = useState<ReviewStatus | "all">("pending");
  const [includeDemo, setIncludeDemo] = useState(true);
  const [page, setPage] = useState(1);

  const [approving, setApproving] = useState<AdminReview | null>(null);
  const [rejecting, setRejecting] = useState<AdminReview | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [replying, setReplying] = useState<AdminReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deleting, setDeleting] = useState<AdminReview | null>(null);

  const filters = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      ...(tab === "all" ? {} : { status: tab }),
      // The API only understands being told to exclude them.
      ...(includeDemo ? {} : { include_demo: false }),
    }),
    [page, tab, includeDemo],
  );

  const list = useQuery({
    queryKey: queryKeys.reviews.admin(filters),
    queryFn: () => reviewsAdmin.list(filters),
    // Switching tab or page otherwise empties the queue and the counters
    // back to their loading state on every click.
    placeholderData: keepPreviousData,
  });

  const google = useQuery({
    queryKey: queryKeys.reviews.google,
    queryFn: () => googleReviews.feed(),
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.reviews.all });
  }

  const approve = useMutation({
    mutationFn: (id: number) => reviewsAdmin.approve(id),
    onSuccess: async () => {
      await refresh();
      success("Published.", {
        description: "It is on the public reviews page now and counts towards the rating.",
      });
      setApproving(null);
    },
    onError: (error) =>
      errorToast("Could not publish that review.", { description: errorMessage(error) }),
  });

  const reject = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => reviewsAdmin.reject(id, note),
    onSuccess: async () => {
      await refresh();
      success("Rejected.", { description: "It stays on file with your note; nothing is public." });
      setRejecting(null);
      setRejectNote("");
    },
    onError: (error) =>
      errorToast("Could not reject that review.", { description: errorMessage(error) }),
  });

  const reply = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => reviewsAdmin.reply(id, body),
    onSuccess: async (row) => {
      await refresh();
      success(row.reply_body ? "Reply saved." : "Reply removed.", {
        description: row.reply_body
          ? row.status === "approved"
            ? "It is under the review on the public page."
            : "It will appear under the review once it is published."
          : undefined,
      });
      setReplying(null);
      setReplyText("");
    },
    onError: (error) =>
      errorToast("Could not save the reply.", { description: errorMessage(error) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => reviewsAdmin.remove(id),
    onSuccess: async () => {
      await refresh();
      success("Deleted.");
      setDeleting(null);
    },
    onError: (error) =>
      errorToast("Could not delete that review.", { description: errorMessage(error) }),
  });

  const refreshGoogle = useMutation({
    mutationFn: () => reviewsAdmin.refreshGoogle(),
    onSuccess: async (outcome) => {
      await cache.invalidateQueries({ queryKey: queryKeys.reviews.google });
      if (outcome.ok) {
        success(`Fetched ${outcome.reviews ?? 0} reviews from Google.`, {
          description:
            outcome.rating != null
              ? `Google's own rating is now ${outcome.rating} over ${outcome.total_ratings ?? 0} ratings.`
              : undefined,
        });
      } else {
        errorToast("Google was not refreshed.", {
          description:
            GOOGLE_REFRESH_REASONS[outcome.reason ?? ""] ??
            outcome.detail ??
            outcome.reason ??
            "The connector gave no reason.",
        });
      }
    },
    onError: (error) =>
      errorToast("The refresh failed.", { description: errorMessage(error) }),
  });

  const rows = list.data?.items ?? [];
  const pending = list.data?.pending ?? 0;
  const summary = list.data?.summary;
  const busy =
    approve.isPending || reject.isPending || reply.isPending || remove.isPending;

  const place = google.data?.place;
  const googleConfigured = Boolean(google.data?.configured);

  function change(next: ReviewStatus | "all") {
    setTab(next);
    setPage(1);
  }

  return (
    <>
      <ScreenHeader
        eyebrow="Site"
        title="Customer reviews"
        description="The moderation queue for reviews written on the public site, and the cached copy of what people wrote on our Google listing."
        actions={
          <Button
            variant="outline"
            loading={refreshGoogle.isPending}
            loadingLabel="Asking Google…"
            onClick={() => refreshGoogle.mutate()}
          >
            Refresh Google reviews
          </Button>
        }
      />

      <Notice tone="warning" title="Approving puts a review on the public site immediately" className="mb-6">
        Nothing a customer writes is published until it is approved here, and
        an approved review counts towards the rating shown to every visitor.
        Rejecting keeps the review and your note on file without publishing
        anything. The eight seeded demo reviews are marked below; they can
        never be published and are not counted.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Waiting for a decision"
          value={pending}
          hint="Across every filter"
          loading={list.isLoading}
        />
        <StatCard
          label="Published"
          value={summary?.count ?? 0}
          hint="Real reviews on the public page"
          loading={list.isLoading}
        />
        <StatCard
          label="Public rating"
          value={summary?.average === null || summary === undefined ? "—" : summary.average.toFixed(1)}
          hint={
            summary?.average === null
              ? "Nothing approved, so there is no rating yet"
              : "Our own reviews only"
          }
          loading={list.isLoading}
        />
        <StatCard
          label="Google"
          value={googleConfigured ? (place?.rating ?? "—") : "Not set up"}
          hint={
            googleConfigured
              ? place?.fetched_at
                ? `Last fetched ${reviewMoment(place.fetched_at)}`
                : "Never fetched"
              : "No Places API key or place id configured"
          }
          loading={google.isLoading}
        />
      </div>

      <div className="panel">
        <Tabs
          label="Review status"
          items={TABS.map((item) => ({
            ...item,
            badge: item.id === "pending" && pending > 0 ? pending : undefined,
          }))}
          value={tab}
          onValueChange={(id) => change(id as ReviewStatus | "all")}
          className="mb-4"
        />

        <Checkbox
          wrapperClassName="mb-4"
          label="Include the seeded demo reviews"
          hint="They are never public and never counted. Turn this off to see only what real customers sent."
          checked={includeDemo}
          onChange={(event) => {
            setIncludeDemo(event.target.checked);
            setPage(1);
          }}
        />

        {list.isError ? (
          <EmptyState
            title="Could not load the queue"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : list.isLoading ? (
          <p className="text-sm text-slate-600">Loading reviews…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title={tab === "pending" ? "Nothing is waiting" : "Nothing here"}
            description={
              tab === "pending"
                ? "Every review that has come in has been dealt with."
                : "No review matches this filter."
            }
          />
        ) : (
          <>
            <div className="grid gap-4">
              {rows.map((review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  canDelete={canDelete}
                  busy={busy}
                  onApprove={() => setApproving(review)}
                  onReject={() => {
                    setRejectNote(review.moderation_note ?? "");
                    setRejecting(review);
                  }}
                  onReply={() => {
                    setReplyText(review.reply_body ?? "");
                    setReplying(review);
                  }}
                  onDelete={() => setDeleting(review)}
                />
              ))}
            </div>

            {(list.data?.pages ?? 1) > 1 && (
              <div className="mt-4">
                <Pagination
                  page={list.data?.page ?? 1}
                  pageCount={list.data?.pages ?? 1}
                  totalItems={list.data?.total}
                  pageSize={list.data?.per_page}
                  onPageChange={setPage}
                  label="Review pages"
                />
              </div>
            )}
          </>
        )}
      </div>

      {!googleConfigured && (
        <p className="mt-6 text-xs text-slate-600">
          Google reviews are not configured, so nothing from Google is shown
          anywhere on the public site. Refreshing will say the same until a
          Places API key and a place id are set on the server.
        </p>
      )}

      <ConfirmDialog
        open={Boolean(approving)}
        onClose={() => setApproving(null)}
        onConfirm={async () => {
          if (approving) await approve.mutateAsync(approving.id);
        }}
        tone="danger"
        title="Publish this review?"
        description="It appears on the public reviews page straight away and counts towards the star rating shown to every visitor. You can reject it later, which takes it back down."
        confirmLabel="Approve and publish"
      >
        {approving && (
          <div className="space-y-1 text-sm text-slate-800">
            <p className="font-semibold">
              {approving.rating} stars — {approving.title || "No headline"}
            </p>
            <p className="text-xs text-slate-600">
              From {approving.author_name}, received {reviewMoment(approving.created_at)}
            </p>
          </div>
        )}
      </ConfirmDialog>

      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject this review"
        description="Nothing is published. The review and your note stay on file; the note is internal and is never shown to the customer or on the site."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={reject.isPending}
              onClick={() => {
                if (rejecting) reject.mutate({ id: rejecting.id, note: rejectNote.trim() });
              }}
            >
              Reject
            </Button>
          </>
        }
      >
        <Field
          label="Why (for the office)"
          showOptional
          hint="Up to 300 characters. Internal only."
        >
          <Textarea
            rows={4}
            maxLength={300}
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            placeholder="e.g. Spam — unrelated product links"
          />
        </Field>
      </Modal>

      <Modal
        open={Boolean(replying)}
        onClose={() => setReplying(null)}
        title={replying?.reply_body ? "Edit the public reply" : "Reply publicly"}
        description="This is shown under the review on the public page, in the company's name. On a complaint it is usually the part a reader learns most from."
        footer={
          <>
            <Button variant="ghost" onClick={() => setReplying(null)}>
              Cancel
            </Button>
            <Button
              loading={reply.isPending}
              onClick={() => {
                if (replying) reply.mutate({ id: replying.id, body: replyText.trim() });
              }}
            >
              {replyText.trim() ? "Save reply" : "Remove reply"}
            </Button>
          </>
        }
      >
        <Field
          label="Your reply"
          hint="Up to 2000 characters. Clearing the box and saving removes the reply."
        >
          <Textarea
            rows={6}
            maxLength={2000}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting.id);
        }}
        tone="danger"
        title={`Delete review #${deleting?.id ?? ""}?`}
        description="The review, its reply and the record that it ever arrived are removed for good. Rejecting instead keeps all three without publishing anything, which is what you want unless the content should not be retained at all."
        confirmLabel="Delete permanently"
      />
    </>
  );
}
