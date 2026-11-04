/**
 * Which language the server should localise promotions into.
 *
 * There is no locale switcher on the site yet, so this reads the `lang` the
 * root layout already declares rather than inventing a second source of
 * truth. The day a switcher lands and changes that attribute, the offers and
 * notices follow it without a change here.
 */
export function pageLanguage(): "en" | "ne" {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang.toLowerCase().startsWith("ne") ? "ne" : "en";
}
