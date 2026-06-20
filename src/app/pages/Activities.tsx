import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Wifi, Cloud } from "lucide-react";
import { API, anonHeaders } from "../lib/supabase";

const seasonActivities = [
  { season: "春·踏青", emoji: "🌸", desc: "探寻城中花期，共赏人间烂漫" },
  { season: "夏·听雨", emoji: "🌧️", desc: "雨声为引，共话心事与清凉" },
  { season: "秋·赏月", emoji: "🌕", desc: "中秋雅集，月下诗词唱和" },
  { season: "冬·围炉", emoji: "🔥", desc: "围炉煮茶，共话岁末与新生" },
];

export const Activities = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  useEffect(() => {
    fetch(`${API}/events`, { headers: anonHeaders() })
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? events : events.filter(e => e.event_type === filter);

  const statusLabel = (s: string) => ({
    upcoming: { label: "即将开始", cls: "bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]" },
    ongoing: { label: "进行中", cls: "bg-[var(--ink-green)]/15 text-[var(--ink-green)]" },
    completed: { label: "已结束", cls: "bg-[var(--ink-mid)]/10 text-[var(--ink-mid)]" },
  }[s] ?? { label: s, cls: "bg-[var(--ink-mid)]/10 text-[var(--ink-mid)]" });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <Cloud className="w-3.5 h-3.5" /> <span>问云雅集</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">问云雅集</h1>
        <p className="mt-2 text-sm text-[var(--ink-mid)]">同门相聚，共话诗与远方</p>
      </div>

      {/* Four Seasons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {seasonActivities.map((s) => (
          <div key={s.season} className="bg-[var(--ink-parchment)] rounded-2xl p-4 text-center border border-[var(--ink-deep)]/8 hover:border-[var(--ink-gold)]/30 transition-colors">
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="font-serif text-sm font-medium text-[var(--ink-deep)] mb-1">{s.season}</div>
            <p className="text-xs text-[var(--ink-mid)] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[["all", "全部"], ["online", "线上雅集"], ["offline", "线下雅集"]] .map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === val
              ? "bg-[var(--ink-deep)] text-[var(--ink-parchment)]"
              : "bg-[var(--ink-deep)]/8 text-[var(--ink-mid)] hover:bg-[var(--ink-deep)]/15"
              }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-[var(--ink-deep)]/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--ink-mid)]/60">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">暂无雅集活动，敬请期待</p>
          <p className="text-xs mt-2 text-[var(--ink-mid)]/40">春有踏青，夏有听雨，秋有赏月，冬有围炉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ev) => {
            const st = statusLabel(ev.status);
            return (
              <div key={ev.id} className="bg-[var(--ink-parchment)] rounded-2xl p-6 border border-[var(--ink-deep)]/8 hover:border-[var(--ink-gold)]/30 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${ev.event_type === "online"
                        ? "bg-blue-50 text-blue-600" : "bg-[var(--ink-green)]/10 text-[var(--ink-green)]"}`}>
                        {ev.event_type === "online" ? <><Wifi className="w-3 h-3" /> 线上</> : <><MapPin className="w-3 h-3" /> 线下</>}
                      </span>
                    </div>
                    <h3 className="font-serif font-medium text-[var(--ink-deep)] text-base mb-2">{ev.title}</h3>
                    {ev.description && <p className="text-sm text-[var(--ink-mid)] leading-relaxed mb-3">{ev.description}</p>}
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-mid)]">
                      {ev.event_date && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(ev.event_date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />{ev.location}
                        </span>
                      )}
                      {ev.organizer && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />主办：{ev.organizer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Rules */}
      <div className="mt-12 bg-[var(--ink-deep)]/4 rounded-2xl p-6">
        <h3 className="font-serif text-sm font-medium text-[var(--ink-deep)] mb-3">线下活动安全须知</h3>
        <ul className="space-y-1 text-xs text-[var(--ink-mid)] leading-relaxed">
          <li>· 地点公开、费用透明、自愿参加、可随时退出</li>
          <li>· 不强制饮酒，不制造暧昧压力</li>
          <li>· 女性、未成年人、独自远行者之安全须特别重视</li>
          <li>· 活动时间、地点、人数、联系人须提前公开</li>
        </ul>
      </div>
    </div>
  );
};
