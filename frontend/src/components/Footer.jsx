import { Link, useLocation, useNavigate } from "react-router-dom";
import { brand } from "../data/brand.js";
import { useSettings } from "../context/SettingsContext.jsx";

export default function Footer() {
  const settings = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  function handleSectionLink(hash) {
    if (location.pathname !== "/") {
      navigate(`/${hash}`);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <footer className="bg-bottle-900 text-beige-100">
      <div className="section-container grid gap-10 py-16 md:grid-cols-4">
        <div>
          <h3 className="font-display text-xl text-cream">{brand.name}</h3>
          <p className="mt-3 max-w-xs text-sm text-beige-100/60">{brand.tagline}</p>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            { label: "All teas", to: "/shop" },
            { label: "Black tea", to: "/shop?category=black-tea" },
            { label: "Green tea", to: "/shop?category=green-tea" },
            { label: "Herbal & tisanes", to: "/shop?category=herbal-tisanes" },
          ]}
        />

        <FooterColumn
          title="Company"
          hashLinks={[
            { label: "About", hash: "#about" },
            { label: "Brew guide", hash: "#brew-guide" },
            { label: "Loyalty", hash: "#loyalty" },
            { label: "Contact", hash: "#contact" },
          ]}
          onHashLinkClick={handleSectionLink}
        />

        <div>
          <h4 className="text-sm font-semibold text-gold-400">Follow</h4>
          <div className="mt-4 flex gap-4">
            <SocialLink href={settings.social_instagram_url} label="Instagram" />
          </div>
          <p className="mt-4 text-xs text-beige-100/50">{settings.contact_address}</p>
        </div>
      </div>

      <div className="border-t border-beige-100/10 py-6 pb-24 md:pb-6">
        <div className="section-container flex flex-col gap-2 text-xs text-beige-100/50 md:flex-row md:justify-between md:pr-20">
          <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/shipping-policy" className="hover:text-beige-100">Shipping Policy</Link>
            <Link to="/returns-policy" className="hover:text-beige-100">Returns</Link>
            <Link to="/privacy-policy" className="hover:text-beige-100">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-beige-100">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links = [], hashLinks = [], onHashLinkClick }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gold-400">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-beige-100/70">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="hover:text-cream">{l.label}</Link>
          </li>
        ))}
        {hashLinks.map((l) => (
          <li key={l.label}>
            <button onClick={() => onHashLinkClick(l.hash)} className="text-left hover:text-cream">{l.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 text-gold-400 transition-colors hover:bg-gold-500 hover:text-bottle-900"
    >
      <span className="text-xs">{label[0]}</span>
    </a>
  );
}
