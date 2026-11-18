import { useEffect, useState } from "react";

// Shows a real photo when there is one (a /api/images/... or https:// link), falls back to the
// emoji used by the built-in demo data, and to a leaf icon when there is nothing — or when a
// photo link is broken — so a product tile is never blank or shows a broken-image icon.
export default function ProductImage({ src, alt = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const isPhoto = typeof src === "string" && /^(https?:\/\/|\/)/.test(src);

  if (isPhoto && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full rounded-[inherit] object-cover"
      />
    );
  }
  if (src && !isPhoto) {
    return <span aria-hidden="true">{src}</span>;
  }
  return (
    <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-bottle-700/40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19c3-4 6-7 10-9" strokeLinecap="round" />
    </svg>
  );
}
