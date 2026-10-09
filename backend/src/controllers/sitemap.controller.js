import { prisma } from "../config/db.js";
import { config } from "../config/env.js";

// GET /sitemap.xml — deliberately mounted outside /api so it's discoverable at the
// conventional root path. Pulls active products live rather than being a static file,
// so it never goes stale as products are added/removed/deactivated.
export async function generateSitemap(req, res) {
  const baseUrl = config.clientOrigin.replace(/\/$/, "");
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: "1.0" },
    { loc: `${baseUrl}/shop`, priority: "0.9" },
    { loc: `${baseUrl}/privacy-policy`, priority: "0.3" },
    { loc: `${baseUrl}/terms-of-service`, priority: "0.3" },
    { loc: `${baseUrl}/shipping-policy`, priority: "0.3" },
    { loc: `${baseUrl}/returns-policy`, priority: "0.3" },
  ];

  const productUrls = products.map((p) => ({
    loc: `${baseUrl}/shop/${p.slug}`,
    lastmod: p.updatedAt.toISOString().slice(0, 10),
    priority: "0.8",
  }));

  const urls = [...staticUrls, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
}
