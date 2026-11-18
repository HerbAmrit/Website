// Single source of truth for site-setting defaults — used when seeding the database,
// and as a fallback if a setting hasn't been saved yet.
export const SITE_SETTINGS_DEFAULTS = {
  social_instagram_url: "https://instagram.com/herbamrit",
  whatsapp_number: "911234567890",
  notify_whatsapp_number: "", // receives contact-form messages + new-order alerts; blank = use whatsapp_number
  amazon_store_url: "https://www.amazon.in/",
  contact_email: "herb.amrit@gmail.com",
  contact_phone: "+91 7488238781",
  contact_address: "Pradhan Nagar, Siliguri, India",
  loyalty_points_per_rupee: "0.1", // 1 point per ₹10 spent
  loyalty_redemption_value: "1",   // 1 point = ₹1 off at checkout
};
