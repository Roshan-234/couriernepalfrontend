"use client";

import { useConsent } from "@/contexts/ConsentContext";

/**
 * The permanent way back to the cookie dialog.
 *
 * It lives in the footer of every public page because withdrawing consent
 * has to be as easy as giving it (Art. 7(3)) — and a choice that can only
 * be revisited by clearing cookies is not withdrawable at all. It is a
 * button rather than a link because it opens a dialog in place; it carries
 * the footer's own link styling so it reads as part of the list.
 */
export default function CookieSettingsLink({ className }: { className?: string }) {
  const { openPreferences } = useConsent();

  return (
    <button type="button" onClick={openPreferences} className={className}>
      Cookie settings
    </button>
  );
}
