/**
 * Family Legacy brand mark — a cream shield holding a coral heart.
 * Designed to sit inside the teal rounded square used across the app
 * headers (replaces the generic lucide ShieldCheck glyph). Size it via
 * `className` (e.g. "h-5 w-5"); colors are brand constants.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Family Legacy"
    >
      <path
        d="M256 108 C300 130 340 142 372 150 L372 300 C372 356 320 396 256 420 C192 396 140 356 140 300 L140 150 C172 142 212 130 256 108 Z"
        fill="#fbf6ee"
      />
      <path
        d="M256 344 C256 344 176 296 176 240 C176 208 200 188 226 188 C242 188 256 204 256 214 C256 204 270 188 286 188 C312 188 336 208 336 240 C336 296 256 344 256 344 Z"
        fill="#f0705a"
      />
    </svg>
  );
}
