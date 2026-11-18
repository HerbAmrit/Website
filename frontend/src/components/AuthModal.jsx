import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetAndClose() {
    closeAuthModal();
    setForm({ name: "", email: "", password: "", phone: "" });
    setError(null);
    setMode("login");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.phone);
      }
      resetAndClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === "login" ? "Log in" : "Create your account";

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bottle-900/50 p-4"
        >
          <motion.div
            role="dialog"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl2 bg-cream p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-bottle-900">{title}</h2>
              <button onClick={resetAndClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-beige-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <Field label="Name" value={form.name} onChange={(v) => updateField("name", v)} required />
              )}
              <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} required />
              {mode === "register" && (
                <Field label="Phone / WhatsApp (optional)" value={form.phone} onChange={(v) => updateField("phone", v)} />
              )}
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => updateField("password", v)}
                required
                minLength={mode === "register" ? 8 : undefined}
              />

              {error && <p className="text-sm text-red-700">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-bottle-800/60">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
                className="font-medium text-gold-600 underline underline-offset-2"
              >
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, type = "text", value, onChange, required, minLength }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-bottle-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-beige-300 bg-beige-50 px-4 py-2.5 text-sm outline-none focus:border-gold-500"
      />
    </div>
  );
}
