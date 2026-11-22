/** The two interfaces. Each has its own screens in src/app/<ui>; src/middleware.ts picks one per request. */
export type UI = "mobile" | "desktop";
export const UIS: UI[] = ["mobile", "desktop"];
/** Set by visiting /mobile/… or /desktop/…; overrides device detection. */
export const UI_COOKIE = "ui";

/** Link that switches to the other interface and stays on the same screen. Needs a full page load, so use <a>, not <Link>. */
export const switchViewHref = (to: UI, pathname: string) => `/${to}${pathname === "/" ? "" : pathname}`;
