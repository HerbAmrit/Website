import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function getWishlist(req, res) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
}

export async function addToWishlist(req, res, next) {
  const { productId } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return next(new ApiError(404, "Product not found."));

  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    create: { userId: req.user.id, productId },
    update: {},
  });
  res.status(201).json(item);
}

export async function removeFromWishlist(req, res) {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user.id, productId: req.params.productId },
  });
  res.status(204).send();
}
