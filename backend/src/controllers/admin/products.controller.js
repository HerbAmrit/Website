import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

// GET /api/admin/products — unlike the public catalog, this includes inactive/out-of-stock
// products and isn't paginated down to "active only".
export async function listAllProducts(req, res) {
  const { search } = req.query;
  const where = search
    ? { OR: [{ name: { contains: String(search), mode: "insensitive" } }, { sku: { contains: String(search), mode: "insensitive" } }] }
    : {};

  const products = await prisma.product.findMany({
    where,
    include: { category: true, brewGuide: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
}

export async function createProduct(req, res, next) {
  const { brewGuide, images: _ignoredImages, ...data } = req.body; // photos are managed only via the /images endpoints (max 5)
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        images: [],
        brewGuide: brewGuide ? { create: brewGuide } : undefined,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === "P2002") return next(new ApiError(409, "A product with that slug or SKU already exists."));
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  const { brewGuide, images: _ignoredImages, ...data } = req.body; // photos are managed only via the /images endpoints (max 5)
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        brewGuide: brewGuide
          ? { upsert: { create: brewGuide, update: brewGuide } }
          : undefined,
      },
    });
    res.json(product);
  } catch (err) {
    if (err.code === "P2025") return next(new ApiError(404, "Product not found."));
    next(err);
  }
}

// Soft delete — a hard delete would break the historical link from past OrderItems to
// this product, so we deactivate instead. It disappears from the storefront but stays
// intact on old invoices and order history.
export async function deleteProduct(req, res, next) {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") return next(new ApiError(404, "Product not found."));
    next(err);
  }
}

export async function updateStock(req, res, next) {
  const { stock } = req.body;
  if (typeof stock !== "number" || stock < 0) {
    return next(new ApiError(400, "Stock must be a non-negative number."));
  }
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { stock } });
    res.json(product);
  } catch (err) {
    if (err.code === "P2025") return next(new ApiError(404, "Product not found."));
    next(err);
  }
}

export async function listCategoriesAdmin(req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}

export async function createCategory(req, res, next) {
  const { name, slug } = req.body;
  if (!name || !slug) return next(new ApiError(400, "Category needs a name and slug."));
  try {
    const category = await prisma.category.create({ data: { name, slug } });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === "P2002") return next(new ApiError(409, "A category with that name or slug already exists."));
    next(err);
  }
}
