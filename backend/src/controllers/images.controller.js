import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /api/images/:id — public. Image URLs never change content (a new upload gets a new id),
// so browsers may cache them for a year.
export async function serveImage(req, res, next) {
  const image = await prisma.productImage.findUnique({ where: { id: req.params.id } });
  if (!image) return next(new ApiError(404, "Image not found."));
  res.set({
    "Content-Type": image.mimeType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  res.send(Buffer.from(image.data));
}
