import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import About from "../components/About.jsx";
import ShopSection from "../components/ShopSection.jsx";
import BrewGuideTeaser from "../components/BrewGuideTeaser.jsx";
import LoyaltySection from "../components/LoyaltySection.jsx";
import ContactSection from "../components/ContactSection.jsx";

export default function Home() {
  const location = useLocation();

  // Supports links like /#shop coming from other routes (e.g. footer, navbar when
  // navigating from a product page back to a homepage section).
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [location]);

  return (
    <>
      <Hero />
      <About />
      <ShopSection />
      <BrewGuideTeaser />
      <LoyaltySection />
      <ContactSection />
    </>
  );
}
