import { prisma } from "../config/db.js";
import { SITE_SETTINGS_DEFAULTS } from "../config/siteSettingsDefaults.js";

// GET /api/settings — public, read-only. The frontend merges this over its own
// hardcoded fallback (data/brand.js) so the storefront still works if the backend
// is unreachable or a setting hasn't been configured yet.
export async function getPublicSettings(req, res) {
  const rows = await prisma.siteSetting.findMany();
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const { notify_whatsapp_number, ...publicSettings } = { ...SITE_SETTINGS_DEFAULTS, ...overrides };
  res.json(publicSettings);
}
