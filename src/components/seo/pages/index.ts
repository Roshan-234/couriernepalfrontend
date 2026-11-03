/**
 * Shared building blocks for the informational and policy pages.
 *
 * All server components: nothing here hydrates, so the content is in the
 * first HTML response a crawler receives.
 */

export { default as PageShell } from "./PageShell";
export type { PageShellProps } from "./PageShell";
export { Prose, Section, Bullets, Steps } from "./Prose";
export type { SectionProps } from "./Prose";
export { default as ToConfirm } from "./ToConfirm";
export { default as DraftNotice } from "./DraftNotice";
export { default as CallToAction } from "./CallToAction";
export type { CallToActionProps } from "./CallToAction";
export { default as ContactLine } from "./ContactLine";
