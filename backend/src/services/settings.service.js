import { prisma } from "../config/db.js";
import { SITE_SETTINGS_DEFAULTS } from "../config/siteSettingsDefaults.js";

// Reads one admin-editable setting, falling back to its default if never saved.
export async function getSetting(key) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? SITE_SETTINGS_DEFAULTS[key] ?? "";
}
