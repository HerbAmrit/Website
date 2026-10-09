import PolicyLayout from "../../components/PolicyLayout.jsx";
import { brand } from "../../data/brand.js";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function PrivacyPolicyPage() {
  const settings = useSettings();

  return (
    <PolicyLayout title="Privacy Policy" updatedNote="Last updated: October 2026">
      <p>
        {brand.name} ("we", "us", "our") respects your privacy. This policy explains what
        information we collect when you use this website, how we use it, and the choices you
        have. It applies to visitors, registered customers, and anyone who places an order
        through this site.
      </p>

      <h2>Information we collect</h2>
      <p>We collect information you provide directly, including:</p>
      <ul>
        <li>Name, email address, and phone number when you create an account</li>
        <li>Shipping address and contact details when you place an order</li>
        <li>Order history, wishlist items, and loyalty points activity</li>
        <li>Messages you send us through the contact form or WhatsApp</li>
      </ul>
      <p>
        We do not collect or store your card, UPI, or bank details directly — payments are
        processed by Razorpay, our third-party payment gateway, under their own privacy and
        security practices.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and fulfil your orders, including shipping and GST invoicing</li>
        <li>To send order-related emails and WhatsApp messages (confirmation, shipping, delivery updates)</li>
        <li>To manage your account, wishlist, and loyalty points balance</li>
        <li>To respond to enquiries sent via the contact form or WhatsApp</li>
        <li>To improve the site and understand how it's used</li>
      </ul>

      <h2>Cookies and similar technologies</h2>
      <p>
        We use essential cookies/local storage to keep you logged in and to remember your cart
        and wishlist between visits. We do not currently use third-party advertising cookies.
      </p>

      <h2>Sharing your information</h2>
      <p>We share information only where necessary to run the business:</p>
      <ul>
        <li>With Razorpay, to process payments</li>
        <li>With our shipping/courier partner(s), to deliver your order</li>
        <li>With email/WhatsApp providers, to send order notifications</li>
        <li>Where required by law, such as tax or regulatory authorities</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>Data security</h2>
      <p>
        We take reasonable technical and organisational measures to protect your data, including
        encrypted connections (HTTPS), hashed passwords, and access controls on our admin
        systems. No method of transmission or storage is 100% secure, and we cannot guarantee
        absolute security.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your personal data by contacting
        us at {settings.contact_email}. Deleting your account may affect your ability to access
        past orders or invoices.
      </p>

      <h2>Children's privacy</h2>
      <p>This website is not directed at children under 18, and we do not knowingly collect data from minors.</p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected by
        updating the "last updated" date above.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy can be sent to {settings.contact_email} or {settings.contact_phone}.
        <br />
        {settings.contact_address}
      </p>
    </PolicyLayout>
  );
}
