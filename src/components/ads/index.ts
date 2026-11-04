/**
 * The company's own promotion surfaces.
 *
 * First-party throughout: the offers are Moonlight's own, served by
 * Moonlight's API, counted by Moonlight's endpoints. There is no third-party
 * script here and there is not meant to be one.
 */

export { default as AdSlot } from "./AdSlot";
export type { AdSlotProps, AdSlotVariant } from "./AdSlot";

export { default as SiteNotices } from "./SiteNotices";
export { default as NoticeBar } from "./NoticeBar";
export type { NoticeBarProps } from "./NoticeBar";
export { default as NoticeModal } from "./NoticeModal";
export type { NoticeModalProps } from "./NoticeModal";
export { default as NoticeToast } from "./NoticeToast";
export type { NoticeToastProps } from "./NoticeToast";

export { toneStyle, TONE_STYLES } from "./tone";
export type { ToneStyle } from "./tone";
export { useAdImpression } from "./useAdImpression";
export { pageLanguage } from "./language";
