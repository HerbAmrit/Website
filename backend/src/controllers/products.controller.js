import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /api/products?search=&category=&sort=price_asc|price_desc|newest&page=&limit=
export async function listProducts(req, res) {
  const { search, category, sort = "newest", page = 1, limit = 12 } = req.query;

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: String(search), mode: "insensitive" } },
        { shortDescription: { contains: String(search), mode: "insensitive" } },
        { origin: { contains: String(search), mode: "insensitive" } },
      ],
    }),
    ...(category && { category: { slug: String(category) } }),
  };

  const orderBy =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    { createdAt: "desc" };

  const take = Math.min(Number(limit) || 12, 48);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, take, skip, include: { category: true } }),
    prisma.product.count({ where }),
  ]);

  res.json({ items, total, page: Number(page), pageSize: take });
}

// GET /api/products/:slug
export async function getProductBySlug(req, res, next) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, brewGuide: true, reviews: true },
  });

  if (!product || !product.isActive) {
    return next(new ApiError(404, "That product doesn't exist or is no longer available."));
  }

  res.json(product);
}

// GET /api/categories
export async function listCategories(req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}
