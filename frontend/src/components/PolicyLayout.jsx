import { Link } from "react-router-dom";
import { useEffect } from "react";
import { brand } from "../data/brand.js";

export default function PolicyLayout({ title, updatedNote, children }) {
  useEffect(() => {
    document.title = `${title} — ${brand.name}`;
  }, [title]);

  return (
    <div className="section-container max-w-3xl py-16">
      <Link to="/" className="text-sm text-bottle-800/50 hover:text-bottle-800">← Back to home</Link>
      <h1 className="mb-2 mt-4 text-3xl font-medium md:text-4xl">{title}</h1>
      {updatedNote && <p className="mb-10 text-sm text-bottle-800/50">{updatedNote}</p>}
      <div className="prose-policy space-y-6 text-sm leading-relaxed text-bottle-800/80 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-bottle-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
