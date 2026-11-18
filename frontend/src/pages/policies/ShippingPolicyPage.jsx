import PolicyLayout from "../../components/PolicyLayout.jsx";
import { brand } from "../../data/brand.js";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function ShippingPolicyPage() {
  const settings = useSettings();

  return (
    <PolicyLayout title="Shipping Policy" updatedNote="Last updated: October 2026">
      <p>This policy explains how {brand.name} ships orders within India.</p>

      <h2>Processing time</h2>
      <p>
        Orders are typically processed and handed to our courier partner within 1–2 business days of payment confirmation. Orders placed on weekends or public holidays
        are processed the next business day.
      </p>

      <h2>Shipping charges</h2>
      <p>
        A flat shipping charge is shown at checkout before payment. Some coupons may include free
        shipping, applied automatically when eligible.
      </p>

      <h2>Delivery timeframes</h2>
      <p>
        Estimated delivery is 3–7 business days depending on your location.
        Remote or rural pincodes may take longer. These are estimates, not guarantees — delays
        can occur due to courier delays, weather, or circumstances outside our control.
      </p>

      <h2>Order tracking</h2>
      <p>
        You'll receive a WhatsApp message when your order ships. You can also check order status any
        time from your account's order history.
      </p>

      <h2>Delivery issues</h2>
      <p>
        If your order hasn't arrived within the estimated window, or arrives damaged, contact us
        at {settings.contact_email} or {settings.contact_phone} with your order number and we'll
        help sort it out.
      </p>

      <h2>Contact us</h2>
      <p>
        {settings.contact_email} · {settings.contact_phone}
        <br />
        {settings.contact_address}
      </p>
    </PolicyLayout>
  );
}
