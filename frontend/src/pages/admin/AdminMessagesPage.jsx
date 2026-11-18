import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";

export default function AdminMessagesPage() {
  const { get, patch } = useAdminApi();
  const [messages, setMessages] = useState(undefined);

  function refresh() {
    get("/messages").then(setMessages).catch(() => setMessages([]));
  }
  useEffect(refresh, []);

  async function markRead(id) {
    await patch(`/messages/${id}/read`, {});
    refresh();
  }

  const unread = messages?.filter((m) => !m.isRead).length ?? 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Messages</h1>
        {unread > 0 && <span className="rounded-full bg-gold-500/20 px-3 py-1 text-sm font-semibold text-gold-600">{unread} unread</span>}
      </div>

      {!messages ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-bottle-800/60">No messages yet. Messages sent through the website's contact form appear here.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-xl2 bg-beige-50 p-5 shadow-card ${m.isRead ? "" : "border-l-4 border-gold-500"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-bottle-900">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-sm text-gold-600 underline">{m.email}</a>
                </div>
                <div className="flex items-center gap-3 text-xs text-bottle-800/50">
                  <span>{new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  {!m.isRead && (
                    <button onClick={() => markRead(m.id)} className="font-medium text-bottle-800 underline">Mark as read</button>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-bottle-800/80">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
