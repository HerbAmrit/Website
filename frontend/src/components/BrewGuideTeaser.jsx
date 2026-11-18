import { motion } from "framer-motion";
import BrewRing from "./BrewRing.jsx";

const STEPS = [
  { label: "Water temp", detail: "Cooler for delicate teas, boiling for robust ones" },
  { label: "Leaf quantity", detail: "Measured per cup for consistent strength" },
  { label: "Steep time", detail: "Timed exactly, so nothing turns bitter" },
  { label: "Infusions", detail: "Many leaves reward a second or third steep" },
];

export default function BrewGuideTeaser() {
  return (
    <section id="brew-guide" className="bg-beige-50 py-24">
      <div className="section-container grid items-center gap-16 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Brew guide</p>
          <h2 className="text-3xl font-medium md:text-4xl">
            Every tea ships with its own steeping instructions.
          </h2>
          <p className="mt-5 max-w-md text-bottle-800/70">
            No guesswork. Each product page has a brew guide tuned to that specific leaf, with a
            live timer so you steep for exactly the right number of seconds.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6">
            {STEPS.map((step) => (
              <div key={step.label}>
                <dt className="text-sm font-semibold text-bottle-900">{step.label}</dt>
                <dd className="mt-1 text-sm text-bottle-800/60">{step.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto rounded-xl2 bg-cream p-10 shadow-card"
        >
          <BrewRing brewTimeSeconds={150} size={200} />
        </motion.div>
      </div>
    </section>
  );
}
