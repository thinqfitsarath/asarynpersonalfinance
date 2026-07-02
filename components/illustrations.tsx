/**
 * Bespoke flat 2D illustrations for the landing page.
 * Clean dark strokes + flat palette fills, matching the app's design tokens.
 * All ambient motion uses CSS classes from globals.css (anim-float, anim-beat,
 * draw-in) which are disabled under prefers-reduced-motion.
 */

const ink = '#3E3833';

/** Small floating doodles used around the hero and CTA banner */
export function DoodleKey({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="18" cy="18" r="9" fill="#FBEED3" stroke={ink} strokeWidth="2.5" />
      <circle cx="18" cy="18" r="3.5" fill="#F2A93B" stroke={ink} strokeWidth="2" />
      <path d="M24.5 24.5L38 38M33 33l4-4M29 37l4-4" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 40C15 32.5 8 26.5 8 18.5 8 13 12 9 17 9c3 0 5.5 1.5 7 4 1.5-2.5 4-4 7-4 5 0 9 4 9 9.5 0 8-7 14-16 21.5z"
        fill="#FCE4DE"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 6l4.5 12.5L41 23l-12.5 4.5L24 40l-4.5-12.5L7 23l12.5-4.5L24 6z"
        fill="#E9E2F6"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleDoc({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M12 8h16l8 8v24H12V8z"
        fill="#DDEBF6"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M28 8v8h8" fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 24h12M18 30h12" stroke="#4A93C8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Hand-drawn squiggle underline that draws itself in under the hero headline */
export function SquiggleUnderline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 14" fill="none" className={className} aria-hidden preserveAspectRatio="none">
      <path
        className="draw-in"
        d="M4 9c30-6 55 5 84-2 29-7 52 4 80-2 20-4 36 1 48 2"
        stroke="#F0705A"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={100}
      />
    </svg>
  );
}

/**
 * Hero scene: a warm vault-house with a beating heart keyhole and a family
 * of three in front, floating keepsake doodles around them.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 420" fill="none" className={className} role="img" aria-label="A family standing in front of their cozy vault-house">
      {/* soft background blobs */}
      <ellipse cx="240" cy="220" rx="210" ry="180" fill="#F5EDDF" />
      <ellipse cx="240" cy="368" rx="180" ry="26" fill="#EBDFCC" />

      {/* floating doodles */}
      <g className="anim-float">
        <g transform="translate(28 60)"><DoodleShapeKey /></g>
      </g>
      <g className="anim-float" style={{ animationDelay: '1.2s' }}>
        <g transform="translate(398 52)"><DoodleShapeHeart /></g>
      </g>
      <g className="anim-float" style={{ animationDelay: '2.4s' }}>
        <g transform="translate(414 190)"><DoodleShapeStar /></g>
      </g>
      <g className="anim-float" style={{ animationDelay: '0.6s' }}>
        <g transform="translate(16 200)"><DoodleShapeDoc /></g>
      </g>

      {/* house-vault */}
      <g className="anim-float-slow">
        {/* chimney */}
        <rect x="318" y="84" width="26" height="46" rx="6" fill="#F0705A" stroke={ink} strokeWidth="3" />
        {/* roof */}
        <path d="M132 156L240 66l108 90H132z" fill="#F0705A" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        {/* body */}
        <rect x="150" y="152" width="180" height="150" rx="14" fill="#D6F0EC" stroke={ink} strokeWidth="3" />
        {/* vault door */}
        <circle cx="240" cy="228" r="46" fill="#0E9384" stroke={ink} strokeWidth="3" />
        <circle cx="240" cy="228" r="34" fill="none" stroke="#FBF6EE" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" />
        {/* beating heart keyhole */}
        <g className="anim-beat" style={{ transformOrigin: '240px 228px' }}>
          <path
            d="M240 242c-8-6.5-14-11.5-14-18 0-4.5 3.4-8 7.6-8 2.6 0 4.9 1.3 6.4 3.4 1.5-2.1 3.8-3.4 6.4-3.4 4.2 0 7.6 3.5 7.6 8 0 6.5-6 11.5-14 18z"
            fill="#FBF6EE"
            stroke={ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
        {/* windows */}
        <rect x="168" y="176" width="34" height="34" rx="9" fill="#FBEED3" stroke={ink} strokeWidth="3" />
        <path d="M185 178v30M170 193h30" stroke={ink} strokeWidth="2" />
        <rect x="278" y="176" width="34" height="34" rx="9" fill="#FBEED3" stroke={ink} strokeWidth="3" />
        <path d="M295 178v30M280 193h30" stroke={ink} strokeWidth="2" />
      </g>

      {/* family: two parents + child, holding hands */}
      <g>
        {/* parent 1 (teal) */}
        <g>
          <circle cx="150" cy="300" r="17" fill="#FBEED3" stroke={ink} strokeWidth="3" />
          <path d="M139 296c2-8 8-12 11-12s9 4 11 12" fill="#3E3833" />
          <circle cx="144.5" cy="302" r="1.8" fill={ink} />
          <circle cx="155.5" cy="302" r="1.8" fill={ink} />
          <path d="M146 308c1.5 1.6 6.5 1.6 8 0" stroke={ink} strokeWidth="2" strokeLinecap="round" />
          <path d="M133 366v-24c0-12 7-22 17-22s17 10 17 22v24" fill="#0E9384" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        </g>
        {/* child (sun) */}
        <g>
          <circle cx="196" cy="322" r="13" fill="#FBEED3" stroke={ink} strokeWidth="3" />
          <path d="M188 318c1.5-6 6-9 8-9s6.5 3 8 9" fill="#3E3833" />
          <circle cx="192" cy="323" r="1.6" fill={ink} />
          <circle cx="200" cy="323" r="1.6" fill={ink} />
          <path d="M193 328c1.2 1.3 4.8 1.3 6 0" stroke={ink} strokeWidth="2" strokeLinecap="round" />
          <path d="M184 366v-14c0-9 5.5-16 12-16s12 7 12 16v14" fill="#F2A93B" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        </g>
        {/* parent 2 (coral) */}
        <g>
          <circle cx="244" cy="300" r="17" fill="#FBEED3" stroke={ink} strokeWidth="3" />
          <path d="M231 300c0-10 6-16 13-16s13 6 13 16c-4-4-8-6-13-6s-9 2-13 6z" fill="#3E3833" />
          <circle cx="238.5" cy="302" r="1.8" fill={ink} />
          <circle cx="249.5" cy="302" r="1.8" fill={ink} />
          <path d="M240 308c1.5 1.6 6.5 1.6 8 0" stroke={ink} strokeWidth="2" strokeLinecap="round" />
          <path d="M227 366v-24c0-12 7-22 17-22s17 10 17 22v24" fill="#F0705A" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        </g>
        {/* joined hands */}
        <path d="M167 340c8 6 12 8 19 6M212 348c8 2 12 0 17-6" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* Inner doodle shapes reused inside HeroScene (plain <g> content, 48x48 scale) */
function DoodleShapeKey() {
  return (
    <>
      <circle cx="18" cy="18" r="9" fill="#FBEED3" stroke={ink} strokeWidth="2.5" />
      <circle cx="18" cy="18" r="3.5" fill="#F2A93B" stroke={ink} strokeWidth="2" />
      <path d="M24.5 24.5L38 38M33 33l4-4" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function DoodleShapeHeart() {
  return (
    <path
      d="M24 40C15 32.5 8 26.5 8 18.5 8 13 12 9 17 9c3 0 5.5 1.5 7 4 1.5-2.5 4-4 7-4 5 0 9 4 9 9.5 0 8-7 14-16 21.5z"
      fill="#FCE4DE"
      stroke={ink}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
}

function DoodleShapeStar() {
  return (
    <path
      d="M24 6l4.5 12.5L41 23l-12.5 4.5L24 40l-4.5-12.5L7 23l12.5-4.5L24 6z"
      fill="#E9E2F6"
      stroke={ink}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
}

function DoodleShapeDoc() {
  return (
    <>
      <path d="M12 8h16l8 8v24H12V8z" fill="#DDEBF6" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 8v8h8" fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 24h12M18 30h12" stroke="#4A93C8" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

/** Feature spot illustrations (square vignettes) */
export function SpotKeys({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden>
      <circle cx="48" cy="48" r="40" fill="#D6F0EC" />
      <circle cx="40" cy="38" r="14" fill="#FBF6EE" stroke={ink} strokeWidth="3" />
      <circle cx="40" cy="38" r="5.5" fill="#0E9384" stroke={ink} strokeWidth="2.5" />
      <path d="M50 48l20 20M63 61l6-6M57 67l6-6" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="30" r="3" fill="#F2A93B" stroke={ink} strokeWidth="2" />
      <circle cx="26" cy="64" r="3" fill="#F0705A" stroke={ink} strokeWidth="2" />
    </svg>
  );
}

export function SpotDocs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden>
      <circle cx="48" cy="48" r="40" fill="#FBEED3" />
      <path d="M30 26h24l10 10v34H30V26z" fill="#FBF6EE" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M54 26v10h10" fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M38 46h18M38 54h18M38 62h10" stroke="#C77F19" strokeWidth="3" strokeLinecap="round" />
      <circle cx="64" cy="62" r="10" fill="#F2A93B" stroke={ink} strokeWidth="3" />
      <path d="M60 62l3 3 5-6" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SpotHands({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden>
      <circle cx="48" cy="48" r="40" fill="#FCE4DE" />
      <path
        d="M48 62c-7-5.5-13-10.5-13-17 0-4.5 3.5-8 7.5-8 2.3 0 4.2 1.2 5.5 3 1.3-1.8 3.2-3 5.5-3 4 0 7.5 3.5 7.5 8 0 6.5-6 11.5-13 17z"
        fill="#F0705A"
        stroke={ink}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M20 64c6 6 12 8 20 8M76 64c-6 6-12 8-20 8" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M24 30l3 3M72 30l-3 3M48 20v4" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Shield artwork for the dark security panel — light strokes on ink */
export function ShieldArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 180" fill="none" className={className} aria-hidden>
      <path
        d="M80 10l58 20v52c0 38-25 66-58 86-33-20-58-48-58-86V30l58-20z"
        fill="#0E9384"
        stroke="#FBF6EE"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M80 78c-10-7.5-17-13.5-17-21.5 0-5.5 4.2-10 9.2-10 2.9 0 5.4 1.5 7.8 4.2 2.4-2.7 4.9-4.2 7.8-4.2 5 0 9.2 4.5 9.2 10 0 8-7 14-17 21.5z"
        fill="#FBF6EE"
        stroke="#0A756A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M62 108l12 12 24-26" stroke="#FBF6EE" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="40" r="4" fill="#F2A93B" />
      <circle cx="142" cy="60" r="4" fill="#F0705A" />
      <circle cx="136" cy="24" r="3" fill="#8B6FC0" />
      <path d="M18 82l4 4m0-4l-4 4" stroke="#F2A93B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Dashed connector between how-it-works steps */
export function DottedConnector({ vertical, className }: { vertical?: boolean; className?: string }) {
  return vertical ? (
    <svg viewBox="0 0 12 56" fill="none" className={className} aria-hidden>
      <path d="M6 2c4 10-4 16 0 26s-4 16 0 26" stroke="#D9C9AE" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
    </svg>
  ) : (
    <svg viewBox="0 0 120 12" fill="none" className={className} aria-hidden preserveAspectRatio="none">
      <path d="M2 6c20-6 32 6 58 0s38 4 58 0" stroke="#D9C9AE" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
    </svg>
  );
}
