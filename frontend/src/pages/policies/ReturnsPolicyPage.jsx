import PolicyLayout from "../../components/PolicyLayout.jsx";
import { brand } from "../../data/brand.js";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function ReturnsPolicyPage() {
  const settings = useSettings();

  return (
    <PolicyLayout title="Returns & Refunds Policy" updatedNote="Last updated: October 2026">
      <p>
        Because {brand.name} sells a consumable food product, our returns policy is different
        from typical retail returns — for hygiene and food-safety reasons, we generally can't
        accept a return simply because a package has been opened. Here's what we do cover.
      </p>

      <h2>What's eligible for a return or refund</h2>
      <ul>
        <li>You received the wrong product</li>
        <li>Your order arrived damaged in transit</li>
        <li>A product is defective, spoiled, or has a manufacturing fault</li>
        <li>Your order didn't arrive within a reasonable time and can't be located</li>
      </ul>
      <p>
        In these cases, contact us within 7 days of delivery with your order
        number and, where relevant, a photo of the issue. We'll arrange a replacement or a
        refund to your original payment method.
      </p>

      <h2>What's not eligible</h2>
      <p>
        For food-safety reasons, we can't accept returns of opened tea packaging for reasons of
        personal preference (e.g. "didn't like the flavour"). If you're unsure about a tea,
        consider starting with a smaller pack size.
      </p>

      <h2>How refunds work</h2>
      <p>
        Approved refunds are issued to your original payment method via Razorpay, typically
        within 5–7 business days of approval. If you paid partly with loyalty
        points, the points portion is returned to your points balance rather than refunded in
        cash.
      </p>

      <h2>Cancelling an order</h2>
      <p>
        Orders can be cancelled for a full refund only before they've shipped. Once an order
        shows as "Shipped" in your account, it can no longer be cancelled — please use the
        return process above instead if there's an issue on arrival.
      </p>

      <h2>Contact us</h2>
      <p>
        To start a return or refund request: {settings.contact_email} or {settings.contact_phone}
        <br />
        {settings.contact_address}
      </p>
    </PolicyLayout>
  );
}
