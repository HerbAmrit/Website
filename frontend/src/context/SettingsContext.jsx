import { createContext, useContext, useEffect, useState } from "react";
import { brand } from "../data/brand.js";

// Falls back to brand.js so the storefront still renders correctly (with the
// original placeholder values) even if the backend is unreachable — same pattern
// used by utils/api.js for products.
const DEFAULTS = {
  social_instagram_url: brand.social.instagram,
  social_facebook_url: brand.social.facebook,
  social_youtube_url: brand.social.youtube,
  social_twitter_url: brand.social.twitter,
  whatsapp_number: brand.whatsappNumber,
  amazon_store_url: brand.amazonStoreUrl,
  contact_email: brand.contact.email,
  contact_phone: brand.contact.phone,
  contact_address: brand.contact.address,
  loyalty_points_per_rupee: "0.1",
  loyalty_redemption_value: "1",
};

const SettingsContext = createContext(DEFAULTS);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSettings((s) => ({ ...s, ...data })))
      .catch(() => {}); // keep defaults if the backend isn't reachable yet
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
