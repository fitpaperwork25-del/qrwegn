// Official WEGN logo — master file WEGN_Logo_Geez_v1.png, cropped to
// content. Do not substitute a generated mark here — this is the real
// asset.
//
// Two color variants, same mark/composition, ink-color only:
// - "light" (public/wegn-logo.png): dark wordmark, for light backgrounds.
// - "dark" (public/wegn-logo-dark.png): white wordmark, for dark
//   backgrounds (e.g. the footer's #102310 green) — the master file's
//   dark ink is otherwise unreadable there.
export default function WegnLogo({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const src = variant === "dark" ? "/wegn-logo-dark.png" : "/wegn-logo.png";
  return <img src={src} alt="WEGN" className={className} />;
}
