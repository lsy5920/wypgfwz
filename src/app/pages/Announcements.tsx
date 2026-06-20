import { useEffect, useState } from "react";
import { Bell, Pin, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { API, anonHeaders } from "../lib/supabase";

const categoryColors: Record<string, string> = {
  "山门公告": "bg-[var(--ink-deep)]/10 text-[var(--ink-deep)]",
  "雅集通知": "bg-[var(--ink-green)]/15 text-[var(--ink-green)]",
  "同门须知": "bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]",
};

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${API}/announcements`, { headers: anonHeaders() })
      .then(r => r.json())
      .then(d => { setAnnouncements(d.announcements ?? []); setLoading(false); });
  }, []);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <Bell className="w-3.5 h-3.5" /> <span>问云公告</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">问云公告</h1>
        <p className="mt-2 text-sm text-[var(--ink-mid)]">山门通告，同门周知</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-[var(--ink-deep)]/5 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 text-[var(--ink-mid)]/60">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>暂无公告</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const isOpen = expanded.has(a.id);
            return (
              <div key={a.id} className={`rounded-2xl border transition-all ${isOpen
                ? "border-[var(--ink-gold)]/30 bg-[var(--ink-parchment)] shadow-sm"
                : "border-[var(--ink-deep)]/8 bg-white/50 hover:border-[var(--ink-deep)]/15"
                }`}>
                <button onClick={() => toggle(a.id)} className="w-full text-left px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {a.is_pinned && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-[var(--ink-gold)] bg-[var(--ink-gold)]/10 px-2 py-0.5 rounded-full">
                            <Pin className="w-3 h-3" /> 置顶
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[a.category] ?? "bg-[var(--ink-mid)]/10 text-[var(--ink-mid)]"}`}>
                          {a.category || "公告"}
                        </span>
                      </div>
                      <h3 className="font-medium text-[var(--ink-deep)] text-sm leading-snug">{a.title}</h3>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--ink-mid)]/60">
                        <Calendar className="w-3 h-3" />
                        {a.published_at ? new Date(a.published_at).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : ""}
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-[var(--ink-mid)] shrink-0 mt-0.5" />
                      : <ChevronDown className="w-4 h-4 text-[var(--ink-mid)] shrink-0 mt-0.5" />
                    }
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <div className="w-full h-px bg-[var(--ink-deep)]/8 mb-4" />
                    {a.summary && <p className="text-sm text-[var(--ink-gold)] mb-3 font-medium">{a.summary}</p>}
                    <div className="text-sm text-[var(--ink-deep)]/80 leading-relaxed whitespace-pre-line">{a.content}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
