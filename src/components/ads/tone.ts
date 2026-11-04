import {
  FaBullhorn,
  FaExclamationTriangle,
  FaGift,
  FaInfoCircle,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import type { NoticeTone } from "@/lib/resources/ads";

/**
 * How each tone looks and how loudly it is announced.
 *
 * The distinction that matters is between a festival promotion and a closed
 * border. A `promotion` is the company's own navy-and-yellow seasonal
 * styling and is announced politely, if at all. A `disruption` is solid red,
 * carries its own standing label, and is an ARIA alert — because somebody
 * whose shipment is sitting at a shut border needs to be told, not offered
 * something.
 *
 * Nothing here animates. The site's reduced-motion rule turns transitions
 * off globally, and a notice that attracts attention by moving is the kind
 * of thing that rule exists to stop; the red does the work instead.
 */
export interface ToneStyle {
  /** The bar / panel surface. */
  surface: string;
  /** Standing label above the title, so the kind of notice reads at a glance. */
  label: string;
  icon: IconType;
  iconClass: string;
  labelClass: string;
  bodyClass: string;
  /** Inline link to the notice's own `link_path`. */
  linkClass: string;
  /** Close control, tuned to sit on the surface above. */
  closeClass: string;
  /** Announced immediately, or only when the visitor gets there. */
  role: "status" | "alert";
  live: "polite" | "assertive";
}

export const TONE_STYLES: Record<NoticeTone, ToneStyle> = {
  info: {
    surface: "bg-teal-50 border-teal-200 text-teal-900",
    label: "Notice",
    icon: FaInfoCircle,
    iconClass: "text-teal-700",
    labelClass: "text-teal-700",
    bodyClass: "text-teal-900/80",
    linkClass: "text-teal-800 decoration-teal-500",
    closeClass: "text-teal-800 hover:bg-teal-100",
    role: "status",
    live: "polite",
  },
  promotion: {
    surface: "bg-[var(--brand-navy)] border-[#2d2c60] text-white",
    label: "Offer",
    icon: FaGift,
    iconClass: "text-[var(--brand-yellow)]",
    labelClass: "text-[var(--brand-yellow)]",
    bodyClass: "text-slate-200",
    linkClass: "text-[var(--brand-yellow)] decoration-[var(--brand-yellow)]",
    closeClass: "text-slate-200 hover:bg-white/15",
    role: "status",
    live: "polite",
  },
  warning: {
    surface: "bg-amber-50 border-amber-300 text-amber-950",
    label: "Please note",
    icon: FaExclamationTriangle,
    iconClass: "text-amber-600",
    labelClass: "text-amber-700",
    bodyClass: "text-amber-900/85",
    linkClass: "text-amber-900 decoration-amber-500",
    closeClass: "text-amber-900 hover:bg-amber-100",
    role: "alert",
    live: "polite",
  },
  disruption: {
    surface: "bg-red-700 border-red-800 text-white",
    label: "Service disruption",
    icon: FaBullhorn,
    iconClass: "text-white",
    labelClass: "text-red-100",
    bodyClass: "text-red-50",
    linkClass: "text-white decoration-red-200",
    closeClass: "text-red-100 hover:bg-white/15",
    role: "alert",
    live: "assertive",
  },
};

/** Unknown tones are possible if the API grows one; treat them as plain. */
export const toneStyle = (tone: NoticeTone): ToneStyle => TONE_STYLES[tone] ?? TONE_STYLES.info;
