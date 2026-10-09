import { motion } from "framer-motion";

const PILLARS = [
  {
    title: "Single-estate sourcing",
    body: "Every batch is traceable to one garden and one harvest window — no blending away character.",
  },
  {
    title: "Small-batch freshness",
    body: "We buy in quantities we can sell within a season, so nothing sits in a warehouse losing aroma.",
  },
  {
    title: "Fair to the source",
    body: "Long-term relationships with growers, paid at prices that reward quality over volume.",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-bottle-900 py-24 text-beige-100">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="eyebrow mb-4 text-gold-400">Our approach</p>
          <h2 className="text-3xl font-medium md:text-4xl">
            We work like the growers do — one garden, one season at a time.
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border-t border-gold-500/30 pt-6"
            >
              <h3 className="font-display text-xl text-cream">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-beige-100/70">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
