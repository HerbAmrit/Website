import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";

const SETTINGS_FIELDS = [
  { key: "social_instagram_url", label: "Instagram URL" },
  { key: "whatsapp_number", label: "WhatsApp number (digits only, with country code, e.g. 911234567890)" },
  { key: "notify_whatsapp_number", label: "WhatsApp number that receives contact-form messages & new-order alerts (digits with country code, e.g. 919876543210 — leave blank to use the chat number above)" },
  { key: "amazon_store_url", label: "Amazon store URL" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "contact_address", label: "Contact address" },
];

const LOYALTY_FIELDS = [
  { key: "loyalty_points_per_rupee", label: "Points earned per ₹1 spent (e.g. 0.1 = 1 point per ₹10)" },
  { key: "loyalty_redemption_value", label: "₹ value per point redeemed (e.g. 1 = 1 point is worth ₹1)" },
];

export default function AdminSettingsPage() {
  const { get, put, post } = useAdminApi();
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [testPhone, setTestPhone] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    get("/settings").then(setValues).catch(() => {});
  }, []);

  function updateValue(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await put("/settings", values);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestNotification(e) {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const result = await post("/notifications/test", { phone: testPhone || undefined });
      setTestResult(result);
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-medium">Site settings</h1>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        <div className="rounded-xl2 bg-beige-50 p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg text-bottle-900">Links & contact info</h2>
          <div className="space-y-4">
            {SETTINGS_FIELDS.map((f) => (
              <Field key={f.key} label={f.label} value={values[f.key] ?? ""} onChange={(v) => updateValue(f.key, v)} />
            ))}
          </div>
        </div>

        <div className="rounded-xl2 bg-beige-50 p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg text-bottle-900">Loyalty program rates</h2>
          <div className="space-y-4">
            {LOYALTY_FIELDS.map((f) => (
              <Field key={f.key} label={f.label} value={values[f.key] ?? ""} onChange={(v) => updateValue(f.key, v)} type="text" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save settings"}</button>
          {saved && <p className="text-sm text-bottle-700">Saved — changes are live on the storefront immediately.</p>}
        </div>
      </form>

      <div className="mt-10 max-w-xl rounded-xl2 bg-beige-50 p-6 shadow-card">
        <h2 className="mb-1 font-display text-lg text-bottle-900">Test notifications</h2>
        <p className="mb-4 text-sm text-bottle-800/60">
          Confirm your WhatsApp (Twilio) credentials work before relying on them for real orders.
        </p>
        <form onSubmit={handleTestNotification} className="grid gap-4 sm:grid-cols-2">
          <Field label="Test WhatsApp number" value={testPhone} onChange={setTestPhone} />
          <button type="submit" disabled={testing} className="btn-outline text-sm sm:col-span-2 sm:w-fit">
            {testing ? "Sending…" : "Send test notification"}
          </button>
        </form>
        {testResult && (
          <div className="mt-4 space-y-1 text-sm">
            {testResult.error && <p className="text-red-700">{testResult.error}</p>}
            {testResult.whatsapp && (
              <p className={testResult.whatsapp.sent ? "text-bottle-700" : "text-bottle-800/60"}>
                WhatsApp: {testResult.whatsapp.sent ? "sent" : `not sent (${testResult.whatsapp.reason})`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-bottle-900">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-beige-300 bg-cream px-4 py-2.5 text-sm outline-none focus:border-gold-500"
      />
    </div>
  );
}
