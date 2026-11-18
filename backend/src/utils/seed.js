// Run with: npm run seed  (after `npx prisma migrate dev`)
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { SITE_SETTINGS_DEFAULTS } from "../config/siteSettingsDefaults.js";

const categories = [
  { name: "Black Tea", slug: "black-tea" },
  { name: "Green Tea", slug: "green-tea" },
  { name: "Oolong", slug: "oolong" },
  { name: "Herbal & Tisanes", slug: "herbal-tisanes" },
];

const products = [
  {
    slug: "darjeeling-first-flush",
    name: "Darjeeling First Flush",
    shortDescription: "Delicate, muscatel-noted spring harvest from the Himalayan foothills.",
    description:
      "Hand-plucked in the first weeks of the Darjeeling season, this first flush carries the bright, floral, slightly astringent character the region is famous for. Light-bodied with a golden liquor and a natural muscatel sweetness.",
    origin: "Darjeeling, West Bengal",
    images: [],
    price: 649,
    compareAtPrice: 749,
    stock: 42,
    sku: "VG-BLK-001",
    categorySlug: "black-tea",
    brewGuide: { waterTempCelsius: 85, brewTimeSeconds: 180, teaQuantityGrams: 2.5, infusions: 2, servingSuggestion: "Best enjoyed neat, without milk, to appreciate the muscatel notes." },
  },
  {
    slug: "assam-golden-tips",
    name: "Assam Golden Tips",
    shortDescription: "Bold, malty, full-bodied black tea with a rich amber liquor.",
    description:
      "Grown in the fertile Brahmaputra valley, this Assam is malty and full-bodied — the classic breakfast tea. Stands up well to milk and sugar.",
    origin: "Assam",
    images: [],
    price: 549,
    stock: 60,
    sku: "VG-BLK-002",
    categorySlug: "black-tea",
    brewGuide: { waterTempCelsius: 95, brewTimeSeconds: 240, teaQuantityGrams: 3, infusions: 1, servingSuggestion: "Traditionally taken with milk and a touch of sugar." },
  },
  {
    slug: "himalayan-jasmine-green",
    name: "Himalayan Jasmine Green",
    shortDescription: "Green tea leaves scented with fresh jasmine blossoms.",
    description:
      "Young green tea leaves layered with fresh jasmine flowers over several nights to absorb their fragrance. Light, floral, and calming.",
    origin: "Kangra Valley, Himachal Pradesh",
    images: [],
    price: 599,
    stock: 35,
    sku: "VG-GRN-001",
    categorySlug: "green-tea",
    brewGuide: { waterTempCelsius: 75, brewTimeSeconds: 120, teaQuantityGrams: 2, infusions: 3, servingSuggestion: "Best without milk; re-steep for a lighter second cup." },
  },
  {
    slug: "nilgiri-oolong",
    name: "Nilgiri Frost Oolong",
    shortDescription: "Semi-oxidised oolong with a smooth, honeyed finish.",
    description:
      "Grown in the Blue Mountains, this oolong is rolled and semi-oxidised to develop a smooth, honeyed character with floral top notes.",
    origin: "Nilgiris, Tamil Nadu",
    images: [],
    price: 699,
    stock: 20,
    sku: "VG-OOL-001",
    categorySlug: "oolong",
    brewGuide: { waterTempCelsius: 90, brewTimeSeconds: 150, teaQuantityGrams: 3, infusions: 4, servingSuggestion: "Rewards multiple short infusions — flavour opens up with each steep." },
  },
  {
    slug: "tulsi-chamomile-tisane",
    name: "Tulsi Chamomile Tisane",
    shortDescription: "Caffeine-free evening blend of holy basil and chamomile.",
    description:
      "A soothing, caffeine-free blend combining holy basil (tulsi) with chamomile flowers — a calming way to close the day.",
    origin: "Blended in India",
    images: [],
    price: 449,
    stock: 50,
    sku: "VG-HRB-001",
    categorySlug: "herbal-tisanes",
    brewGuide: { waterTempCelsius: 100, brewTimeSeconds: 300, teaQuantityGrams: 2, infusions: 1, servingSuggestion: "Steep covered to retain aromatic oils; enjoy before bed." },
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
    categoryMap[c.slug] = created.id;
  }

  console.log("Seeding products...");
  for (const p of products) {
    const { categorySlug, brewGuide, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: { ...productData, categoryId: categoryMap[categorySlug] },
      update: {}, // never overwrite products that already exist (keeps admin edits and uploaded photos)
    });
    if (brewGuide) {
      await prisma.brewGuide.upsert({
        where: { productId: product.id },
        create: { ...brewGuide, productId: product.id },
        update: brewGuide,
      });
    }
  }

  console.log("Seeding admin account...");
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where: { email: "admin@herbamrit.com" },
    create: { name: "Admin", email: "admin@herbamrit.com", passwordHash: adminPasswordHash, role: "ADMIN" },
    update: { role: "ADMIN" },
  });
  console.log("  -> log in at /admin with admin@herbamrit.com / Admin@12345 (change this before going live)");

  console.log("Seeding demo coupons...");
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    create: { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrderValue: 500 },
    update: {},
  });
  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    create: { code: "FREESHIP", type: "FIXED", value: 0, freeShipping: true, minOrderValue: 800 },
    update: {},
  });

  console.log("Seeding site settings...");
  await Promise.all(
    Object.entries(SITE_SETTINGS_DEFAULTS).map(([key, value]) =>
      prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: {} })
    )
  );

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
