"use client";

const STORAGE_KEY = "drift-theme";
const FADE_MS = 100;

/**
 * A quiet light/dark toggle. The theme follows the OS until the reader
 * clicks once; from then on their explicit choice is stored in
 * localStorage and applied as a class on <html>
 */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isDark =
      root.classList.contains("dark") ||
      (!root.classList.contains("light") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";

    // Brief cross-fade only while toggling (see .theme-transition).
    root.classList.add("theme-transition");
    root.classList.remove("light", "dark");
    root.classList.add(next);
    window.setTimeout(
      () => root.classList.remove("theme-transition"),
      FADE_MS,
    );

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private mode / storage disabled)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      className="text-sm text-ink-soft transition-colors hover:text-accent"
    >
      <span className="icon-sun" aria-hidden>
        ☼
      </span>
      <span className="icon-moon" aria-hidden>
        ☾
      </span>
    </button>
  );
}
