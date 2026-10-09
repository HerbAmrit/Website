import { prisma } from "../../config/db.js";
import { SITE_SETTINGS_DEFAULTS } from "../../config/siteSettingsDefaults.js";

export async function listSettingsAdmin(req, res) {
  const rows = await prisma.siteSetting.findMany();
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ ...SITE_SETTINGS_DEFAULTS, ...overrides });
}

// PUT /api/admin/settings  Body: { key: value, ... } — any subset of known keys.
export async function updateSettings(req, res) {
  const entries = Object.entries(req.body).filter(([key]) => key in SITE_SETTINGS_DEFAULTS);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );
  res.json({ updated: entries.length });
}
