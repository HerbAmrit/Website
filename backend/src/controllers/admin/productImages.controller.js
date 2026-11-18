import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

const MAX_IMAGES = 5;
const MAX_BYTES = 2 * 1024 * 1024;
const DATA_URL_PREFIX = /^data:image\/(jpeg|png|webp);base64,/;

// Identify the real file type from its first bytes — never trust the declared type.
function detectMime(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

// POST /api/admin/products/:id/images   Body: { dataUrl }
export async function addProductImage(req, res, next) {
  const { dataUrl } = req.body;
  if (typeof dataUrl !== "string" || !DATA_URL_PREFIX.test(dataUrl)) {
    return next(new ApiError(400, "Upload a JPG, PNG or WebP image."));
  }
  const buffer = Buffer.from(dataUrl.replace(DATA_URL_PREFIX, ""), "base64");
  if (buffer.length > MAX_BYTES) return next(new ApiError(413, "That image is too large (max 2 MB)."));
  const mimeType = detectMime(buffer);
  if (!mimeType) return next(new ApiError(400, "That file isn't a valid JPG, PNG or WebP image."));

  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return next(new ApiError(404, "Product not found."));
  if (product.images.length >= MAX_IMAGES) {
    return next(new ApiError(400, `A product can have at most ${MAX_IMAGES} photos. Delete one first.`));
  }

  const image = await prisma.productImage.create({ data: { productId: product.id, mimeType, data: buffer } });
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { images: { push: `/api/images/${image.id}` } },
  });
  res.status(201).json(updated);
}

// POST /api/admin/products/:id/images/remove   Body: { url }
export async function removeProductImage(req, res, next) {
  const { url } = req.body;
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return next(new ApiError(404, "Product not found."));
  if (!product.images.includes(url)) return next(new ApiError(404, "That photo isn't on this product."));

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { images: { set: product.images.filter((u) => u !== url) } },
  });
  const match = /^\/api\/images\/([\w-]+)$/.exec(url);
  if (match) await prisma.productImage.deleteMany({ where: { id: match[1], productId: product.id } });
  res.json(updated);
}

// POST /api/admin/products/:id/images/main   Body: { url } — moves that photo to the front
export async function setMainProductImage(req, res, next) {
  const { url } = req.body;
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return next(new ApiError(404, "Product not found."));
  if (!product.images.includes(url)) return next(new ApiError(404, "That photo isn't on this product."));

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { images: { set: [url, ...product.images.filter((u) => u !== url)] } },
  });
  res.json(updated);
}
