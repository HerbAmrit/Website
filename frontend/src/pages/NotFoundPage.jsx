import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="section-container flex flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="text-3xl font-medium">This page has steeped away.</h1>
      <p className="mt-3 text-bottle-800/60">We couldn't find what you were looking for.</p>
      <Link to="/" className="btn-primary mt-8">Back home</Link>
    </div>
  );
}
