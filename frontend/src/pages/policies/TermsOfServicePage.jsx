import PolicyLayout from "../../components/PolicyLayout.jsx";
import { brand } from "../../data/brand.js";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function TermsOfServicePage() {
  const settings = useSettings();

  return (
    <PolicyLayout title="Terms of Service" updatedNote="Last updated: October 2026">
      <p>
        These Terms of Service govern your use of the {brand.name} website and any purchases made
        through it. By using this site or placing an order, you agree to these terms.
      </p>

      <h2>Account registration</h2>
      <p>
        You need an account to check out. You're responsible for keeping your login details
        confidential and for all activity under your account. Provide accurate information when
        registering.
      </p>

      <h2>Orders and payment</h2>
      <ul>
        <li>All orders are subject to product availability and stock at the time of payment</li>
        <li>Prices are listed in INR and include GST where applicable, shown at checkout before payment</li>
        <li>Payment is processed securely through Razorpay (UPI, Visa, Mastercard)</li>
        <li>An order is confirmed only once payment has been successfully verified</li>
        <li>We reserve the right to cancel an order (with a full refund) if stock runs out after payment, or if we suspect fraud</li>
      </ul>

      <h2>Pricing and product information</h2>
      <p>
        We try to keep product descriptions, images, and prices accurate, but errors can happen.
        If we discover a pricing or listing error on an order you've placed, we'll contact you
        before proceeding, and you may cancel for a full refund.
      </p>

      <h2>Coupons and loyalty points</h2>
      <p>
        Coupon codes and loyalty point redemption are subject to the conditions shown at checkout
        (minimum order value, expiry, usage limits). We may change or discontinue the loyalty
        program at any time, without affecting points already earned.
      </p>

      <h2>Shipping and returns</h2>
      <p>
        See our <a href="/shipping-policy" className="text-gold-600 underline">Shipping Policy</a> and{" "}
        <a href="/returns-policy" className="text-gold-600 underline">Returns Policy</a> for details.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site — text, images, logos, and design — belongs to {brand.name} or
        its licensors and may not be reproduced without permission.
      </p>

      <h2>Prohibited use</h2>
      <p>
        You agree not to misuse this site — including attempting to access it via unauthorized
        means, interfering with its security, or using it for any unlawful purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        {brand.name} is not liable for indirect or consequential losses arising from use of this
        site, to the fullest extent permitted by law. Nothing here limits liability that cannot
        be excluded under applicable law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, with courts in Siliguri, West Bengal
        having exclusive jurisdiction.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms from time to time; continued use of the site after changes means you accept the updated terms.</p>

      <h2>Contact us</h2>
      <p>
        {settings.contact_email} · {settings.contact_phone}
        <br />
        {settings.contact_address}
      </p>
    </PolicyLayout>
  );
}
