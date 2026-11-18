import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchProducts } from "../utils/api.js";
import { useSettings } from "../context/SettingsContext.jsx";
import ProductCard from "./ProductCard.jsx";

export default function ShopSection() {
  const [products, setProducts] = useState([]);
  const settings = useSettings();

  useEffect(() => {
    fetchProducts({ limit: 4 }).then((res) => setProducts(res.items ?? []));
  }, []);

  return (
    <section id="shop" className="bg-beige-100 py-24">
      <div className="section-container">
        <div className="mb-12 flex flex-wrap items-start justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow mb-4">The collection</p>
            <h2 className="text-3xl font-medium md:text-4xl">Shop this season's teas</h2>
          </motion.div>

          {/* Required: "Buy on Amazon" — always visible, top-right of the Shop section,
              independent of the on-site checkout flow below. */}
          <a
            href={settings.amazon_store_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline shrink-0 border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-bottle-900"
          >
            Buy on Amazon
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/shop" className="btn-primary">
            View full catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
