import { useRef, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";
import ProductImage from "../../components/ProductImage.jsx";

const MAX_IMAGES = 5;

// Shrinks a photo in the browser before uploading (max 1200px, JPEG), so uploads are fast and
// the database stays small — a typical phone photo drops from several MB to roughly 200 KB.
async function compressImage(file, maxSize = 1200, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // flatten transparent PNGs onto white
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function AdminProductImages({ product, onChange }) {
  const { post } = useAdminApi();
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const images = product.images || [];

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      let current = product;
      for (const file of files) {
        if ((current.images || []).length >= MAX_IMAGES) {
          setError(`A product can have at most ${MAX_IMAGES} photos — the extra files were skipped.`);
          break;
        }
        let dataUrl;
        try {
          dataUrl = await compressImage(file);
        } catch {
          throw new Error(`"${file.name}" couldn't be read as an image. Use a JPG, PNG or WebP file.`);
        }
        current = await post(`/products/${product.id}/images`, { dataUrl });
        onChange(current);
      }
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action, url) {
    setError(null);
    setBusy(true);
    try {
      onChange(await post(`/products/${product.id}/images/${action}`, { url }));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-bottle-900">Photos ({images.length}/{MAX_IMAGES})</span>
        <button
          type="button"
          disabled={busy || images.length >= MAX_IMAGES}
          onClick={() => fileInput.current?.click()}
          className="btn-outline px-4 py-1.5 text-xs"
        >
          {busy ? "Working…" : "Add photos"}
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {images.length === 0 ? (
        <p className="text-xs text-bottle-800/50">No photos yet. The first photo you add becomes the main one shown in the shop.</p>
      ) : (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <li key={url} className="space-y-1">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-beige-200">
                <ProductImage src={url} alt={`Photo ${i + 1}`} />
              </div>
              <div className="flex flex-col items-center gap-0.5 text-[11px]">
                {i === 0 ? (
                  <span className="font-semibold text-gold-600">Main</span>
                ) : (
                  <button type="button" disabled={busy} onClick={() => runAction("main", url)} className="text-bottle-800 underline">
                    Make main
                  </button>
                )}
                <button type="button" disabled={busy} onClick={() => runAction("remove", url)} className="text-red-700 underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
