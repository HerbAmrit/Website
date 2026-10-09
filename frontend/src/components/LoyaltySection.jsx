import { motion } from "framer-motion";

export default function LoyaltySection() {
  return (
    <section id="loyalty" className="bg-bottle-800 py-24 text-beige-100">
      <div className="section-container grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-4 text-gold-400">Leaf Rewards</p>
          <h2 className="text-3xl font-medium md:text-4xl">Earn points on every order.</h2>
          <p className="mt-5 max-w-md text-beige-100/70">
            Every purchase earns points you can redeem against future orders. Points, balance,
            and redemption at checkout land with account sign-in — coming with the checkout
            release.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "1", label: "Earn", body: "Points added automatically after each delivered order." },
            { n: "2", label: "Track", body: "See your balance any time from your account." },
            { n: "3", label: "Redeem", body: "Apply points at checkout to reduce what you pay." },
          ].map((step) => (
            <div key={step.n} className="rounded-xl2 border border-gold-500/30 p-5">
              <span className="font-display text-2xl text-gold-400">{step.n}</span>
              <h3 className="mt-2 text-sm font-semibold text-cream">{step.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-beige-100/60">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
