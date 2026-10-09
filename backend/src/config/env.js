import dotenv from "dotenv";
dotenv.config();

function req(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

export const config = {
  port: req("PORT", 4000),
  nodeEnv: req("NODE_ENV", "development"),
  clientOrigin: req("CLIENT_ORIGIN", "http://localhost:5173"),

  jwtSecret: req("JWT_SECRET", "dev-only-insecure-secret-change-me"),
  jwtExpiresIn: req("JWT_EXPIRES_IN", "7d"),

  razorpay: {
    keyId: req("RAZORPAY_KEY_ID", ""),
    keySecret: req("RAZORPAY_KEY_SECRET", ""),
    webhookSecret: req("RAZORPAY_WEBHOOK_SECRET", ""),
    get isConfigured() {
      return Boolean(this.keyId && this.keySecret);
    },
  },

  smtp: {
    host: req("SMTP_HOST", ""),
    port: Number(req("SMTP_PORT", 587)),
    user: req("SMTP_USER", ""),
    pass: req("SMTP_PASS", ""),
    from: req("SMTP_FROM", "HerbAmrit <orders@example.com>"),
    get isConfigured() {
      return Boolean(this.host && this.user && this.pass);
    },
  },

  whatsapp: {
    accountSid: req("TWILIO_ACCOUNT_SID", ""),
    authToken: req("TWILIO_AUTH_TOKEN", ""),
    fromNumber: req("TWILIO_WHATSAPP_FROM", ""), // Twilio WhatsApp sender, e.g. "+14155238886" for their sandbox
    defaultCountryCode: req("DEFAULT_COUNTRY_CODE", "+91"),
    get isConfigured() {
      return Boolean(this.accountSid && this.authToken && this.fromNumber);
    },
  },

  gst: {
    businessName: req("GST_BUSINESS_NAME", "Your Business Legal Name"),
    number: req("GST_NUMBER", ""),
    address: req("GST_BUSINESS_ADDRESS", ""),
  },
};
