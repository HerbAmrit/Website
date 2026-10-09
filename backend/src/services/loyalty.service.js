import { prisma } from "../config/db.js";
import { SITE_SETTINGS_DEFAULTS } from "../config/siteSettingsDefaults.js";

async function getSetting(key) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? SITE_SETTINGS_DEFAULTS[key];
}

export async function computeEarnedPoints(amountSpent) {
  const rate = Number(await getSetting("loyalty_points_per_rupee"));
  return Math.floor(amountSpent * rate);
}

export async function computeRedemptionValue(points) {
  const rate = Number(await getSetting("loyalty_redemption_value"));
  return points * rate;
}
