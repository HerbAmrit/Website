import { useState } from "react";
import { useSettings } from "../context/SettingsContext.jsx";

export default function ContactSection() {
  const settings = useSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Couldn't send your message. Please try again.");
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  // Direct click-to-chat link — works instantly with no setup, as a second route to the owner.
  const waDigits = String(settings.whatsapp_number || "").replace(/\D/g, "");
  const waLink = `https://wa.me/${waDigits}?text=${encodeURIComponent(`Hi, this is ${form.name || "a customer"}. ${form.message}`.trim())}`;

  const inputClass = "w-full rounded-lg border border-beige-300 bg-cream px-4 py-2.5 text-sm outline-none focus:border-gold-500";

  return (
    <section id="contact" className="bg-beige-100 py-24">
      <div className="section-container grid gap-16 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Get in touch</p>
          <h2 className="text-3xl font-medium md:text-4xl">Questions about an order or a tea?</h2>
          <div className="mt-8 space-y-3 text-sm text-bottle-800/80">
            <p>{settings.contact_email}</p>
            <p>{settings.contact_phone}</p>
            <p>{settings.contact_address}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl2 bg-beige-50 p-8 shadow-card">
          {status === "sent" ? (
            <div className="space-y-4">
              <p className="text-bottle-800">Thanks — your message has been sent. We'll get back to you within a day.</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex">
                Want a faster reply? Chat on WhatsApp
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-bottle-900">Name</label>
                <input id="name" required minLength={2} maxLength={100} type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-bottle-900">Email</label>
                <input id="email" required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-bottle-900">Message</label>
                <textarea id="message" required minLength={5} maxLength={2000} rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} className={inputClass} />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
