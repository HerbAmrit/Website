// Demo catalog data. In production this is served by GET /api/products — see
// src/utils/api.js, which falls back to this file if the API isn't reachable yet
// (so the storefront is fully browsable before the backend is deployed).

export const categories = [
  { slug: "black-tea", name: "Black Tea" },
  { slug: "green-tea", name: "Green Tea" },
  { slug: "oolong", name: "Oolong" },
  { slug: "herbal-tisanes", name: "Herbal & Tisanes" },
];

export const products = [
  {
    id: "1",
    slug: "darjeeling-first-flush",
    name: "Darjeeling First Flush",
    shortDescription: "Delicate, muscatel-noted spring harvest from the Himalayan foothills.",
    description:
      "Hand-plucked in the first weeks of the Darjeeling season, this first flush carries the bright, floral, slightly astringent character the region is famous for. Light-bodied with a golden liquor and a natural muscatel sweetness that lingers on the finish.",
    origin: "Darjeeling, West Bengal",
    image: "🍃",
    price: 649,
    compareAtPrice: 749,
    stock: 42,
    category: "black-tea",
    rating: 4.8,
    reviewCount: 132,
    brewGuide: {
      waterTempCelsius: 85,
      brewTimeSeconds: 180,
      teaQuantityGrams: 2.5,
      infusions: 2,
      servingSuggestion: "Best enjoyed neat, without milk, to appreciate the muscatel notes.",
    },
  },
  {
    id: "2",
    slug: "assam-golden-tips",
    name: "Assam Golden Tips",
    shortDescription: "Bold, malty, full-bodied black tea with a rich amber liquor.",
    description:
      "Grown in the fertile Brahmaputra valley, this Assam is malty and full-bodied — the classic breakfast tea. Stands up well to milk and sugar without losing its character.",
    origin: "Assam",
    image: "🍂",
    price: 549,
    stock: 60,
    category: "black-tea",
    rating: 4.7,
    reviewCount: 98,
    brewGuide: {
      waterTempCelsius: 95,
      brewTimeSeconds: 240,
      teaQuantityGrams: 3,
      infusions: 1,
      servingSuggestion: "Traditionally taken with milk and a touch of sugar.",
    },
  },
  {
    id: "3",
    slug: "himalayan-jasmine-green",
    name: "Himalayan Jasmine Green",
    shortDescription: "Green tea leaves scented with fresh jasmine blossoms.",
    description:
      "Young green tea leaves layered with fresh jasmine flowers over several nights to absorb their fragrance. Light, floral, and calming — a cup for slowing down.",
    origin: "Kangra Valley, Himachal Pradesh",
    image: "🌿",
    price: 599,
    stock: 35,
    category: "green-tea",
    rating: 4.6,
    reviewCount: 74,
    brewGuide: {
      waterTempCelsius: 75,
      brewTimeSeconds: 120,
      teaQuantityGrams: 2,
      infusions: 3,
      servingSuggestion: "Best without milk; re-steep for a lighter, sweeter second cup.",
    },
  },
  {
    id: "4",
    slug: "nilgiri-frost-oolong",
    name: "Nilgiri Frost Oolong",
    shortDescription: "Semi-oxidised oolong with a smooth, honeyed finish.",
    description:
      "Grown in the Blue Mountains, this oolong is rolled and semi-oxidised to develop a smooth, honeyed character with floral top notes that unfold over several infusions.",
    origin: "Nilgiris, Tamil Nadu",
    image: "🍵",
    price: 699,
    stock: 20,
    category: "oolong",
    rating: 4.9,
    reviewCount: 51,
    brewGuide: {
      waterTempCelsius: 90,
      brewTimeSeconds: 150,
      teaQuantityGrams: 3,
      infusions: 4,
      servingSuggestion: "Rewards multiple short infusions — flavour opens up with each steep.",
    },
  },
  {
    id: "5",
    slug: "tulsi-chamomile-tisane",
    name: "Tulsi Chamomile Tisane",
    shortDescription: "Caffeine-free evening blend of holy basil and chamomile.",
    description:
      "A soothing, caffeine-free blend combining holy basil (tulsi) with chamomile flowers — a calming way to close the day.",
    origin: "Blended in India",
    image: "🌼",
    price: 449,
    stock: 50,
    category: "herbal-tisanes",
    rating: 4.5,
    reviewCount: 60,
    brewGuide: {
      waterTempCelsius: 100,
      brewTimeSeconds: 300,
      teaQuantityGrams: 2,
      infusions: 1,
      servingSuggestion: "Steep covered to retain aromatic oils; enjoy before bed.",
    },
  },
  {
    id: "6",
    slug: "kangra-white-tips",
    name: "Kangra White Tips",
    shortDescription: "Rare, minimally processed white tea with a delicate sweetness.",
    description:
      "Made from young buds picked only a few days a year, this white tea is barely processed — the closest cup to the living leaf. Subtle, sweet, and prized by connoisseurs.",
    origin: "Kangra Valley, Himachal Pradesh",
    image: "🤍",
    price: 899,
    stock: 12,
    category: "green-tea",
    rating: 4.9,
    reviewCount: 28,
    brewGuide: {
      waterTempCelsius: 80,
      brewTimeSeconds: 240,
      teaQuantityGrams: 2,
      infusions: 3,
      servingSuggestion: "Use slightly more leaf and a longer steep to draw out its subtle sweetness.",
    },
  },
];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}
