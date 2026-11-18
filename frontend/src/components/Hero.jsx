import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BrewRing from "./BrewRing.jsx";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-beige-100">
      <div className="section-container grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-4">Estate to cup, in one steep</p>
          <h1 className="text-4xl font-medium leading-tight md:text-6xl">
            Tea, timed the way<br />the garden intended.
          </h1>
          <p className="mt-6 max-w-md text-base text-bottle-800/80 md:text-lg">
            Single-origin leaves from Darjeeling, Assam, and the Nilgiris — each one shipped with
            its own brew guide, so every cup tastes the way the estate meant it to.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary">
              Shop the collection
            </Link>
            <a href="#brew-guide" className="btn-outline">
              See the brew guide
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto flex justify-center"
        >
          <div className="rounded-xl2 bg-bottle-800 p-10 shadow-card">
            <BrewRing brewTimeSeconds={180} size={220} onDark />
            <p className="mt-4 max-w-[220px] text-center text-xs text-beige-100/70">
              Every product page has a live steeping timer, tuned to that tea's ideal brew.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
