import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Feather, Users, Bell, ChevronRight, MapPin, Scroll, Star, Lamp } from "lucide-react";
import { API, anonHeaders } from "../lib/supabase";

const purposes = [
  { icon: "🕯️", title: "陪伴", desc: "使孤者不孤，使疲者可息，得一方可安心言说之地" },
  { icon: "🌿", title: "清醒", desc: "不以热闹遮蔽现实，在互相照见中明白自己、整理生活" },
  { icon: "📖", title: "成长", desc: "以读书、写作、谈心、行走为径，使日子有光" },
  { icon: "⚖️", title: "守正", desc: "依法而行，守护信息安全，尊重个人边界" },
];

const wishes = [
  { icon: "✨", label: "真诚" }, { icon: "🌸", label: "温和" },
  { icon: "💡", label: "清醒" }, { icon: "🤝", label: "互助" },
  { icon: "🛡️", label: "守界" }, { icon: "🏗️", label: "共建" },
  { icon: "🌟", label: "向光" },
];

export const Home = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/announcements`, { headers: anonHeaders() })
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements?.slice(0, 3) ?? []));
    fetch(`${API}/members`, { headers: anonHeaders() })
      .then(r => r.json())
      .then(d => {
        const members = d.members ?? [];
        setMemberCount(members.length);
        setRecentMembers(members.slice(-6).reverse());
      });
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background ink wash decoration */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg className="absolute bottom-0 left-0 w-full h-full opacity-[0.06]" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
            {/* Mountains */}
            <path d="M0 600 L200 300 L400 420 L600 200 L800 350 L1000 180 L1200 320 L1440 250 L1440 600Z" fill="#1e2d4a" />
            <path d="M0 600 L300 400 L500 480 L700 320 L900 430 L1100 280 L1300 380 L1440 340 L1440 600Z" fill="#4a6280" />
          </svg>
          {/* Bamboo right */}
          <svg className="absolute right-0 top-0 h-full w-32 opacity-[0.08]" viewBox="0 0 100 600" preserveAspectRatio="xMaxYMid meet">
            {[0, 80, 160, 240, 320, 400].map((y, i) => (
              <g key={i}>
                <line x1="60" y1={y} x2="60" y2={y + 70} stroke="#5a8a6a" strokeWidth="6" strokeLinecap="round" />
                <ellipse cx="60" cy={y + 70} rx="6" ry="3" fill="#5a8a6a" />
                {i % 2 === 0 && <path d={`M60 ${y + 20} Q80 ${y + 10} 90 ${y + 30}`} stroke="#5a8a6a" strokeWidth="2.5" fill="none" />}
                {i % 2 === 1 && <path d={`M60 ${y + 30} Q40 ${y + 15} 30 ${y + 35}`} stroke="#5a8a6a" strokeWidth="2.5" fill="none" />}
              </g>
            ))}
          </svg>
          {/* Lantern top right */}
          <svg className="absolute top-8 right-32 w-10 h-16 opacity-10" viewBox="0 0 40 60">
            <line x1="20" y1="0" x2="20" y2="8" stroke="#c8954a" strokeWidth="1.5" />
            <ellipse cx="20" cy="12" rx="8" ry="4" fill="#c8954a" opacity="0.5" />
            <path d="M12 12 Q10 30 12 44 Q20 48 28 44 Q30 30 28 12Z" fill="#c8954a" opacity="0.6" />
            <line x1="20" y1="48" x2="20" y2="56" stroke="#c8954a" strokeWidth="1.5" />
            <path d="M16 56 Q20 60 24 56" stroke="#c8954a" strokeWidth="1" fill="none" />
          </svg>
          {/* Cloud wisps */}
          <svg className="absolute top-16 left-16 w-24 opacity-[0.07]" viewBox="0 0 100 40">
            <ellipse cx="50" cy="25" rx="40" ry="12" fill="#8ba4bf" />
            <ellipse cx="35" cy="20" rx="22" ry="10" fill="#8ba4bf" />
            <ellipse cx="65" cy="18" rx="18" ry="9" fill="#8ba4bf" />
          </svg>
        </div>

        <div className="relative z-10 text-center px-4 py-20">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border border-[var(--ink-deep)]/20 text-xs text-[var(--ink-mid)] tracking-widest">
            古风特色现代社群
          </div>
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-[var(--ink-deep)] mb-4 tracking-wider leading-none">
            问云派
          </h1>
          <p className="text-[var(--ink-mid)] text-base md:text-lg mb-2 tracking-widest">
            以云为幕，以灯为证
          </p>
          <p className="text-[var(--ink-mid)]/70 text-sm md:text-base mb-8 tracking-wide">
            清醒温柔，同行自渡
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/charter"
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink-deep)] text-[var(--ink-parchment)] rounded-full text-sm font-medium hover:bg-[var(--ink-mid)] transition-colors">
              <BookOpen className="w-4 h-4" /> 阅读立派金典
            </Link>
            <Link to="/assessment"
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink-gold)] text-white rounded-full text-sm font-medium hover:bg-[var(--ink-gold)]/90 transition-colors">
              <Feather className="w-4 h-4" /> 参加问心考核
            </Link>
          </div>
          {memberCount > 0 && (
            <p className="mt-6 text-xs text-[var(--ink-mid)]/60">
              已有 <span className="text-[var(--ink-gold)] font-medium">{memberCount}</span> 位同门在此相聚
            </p>
          )}
        </div>
      </section>

      {/* 宗旨 */}
      <section className="py-16 px-4 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs tracking-widest text-[var(--ink-gold)] mb-2">— 宗 旨 —</div>
            <h2 className="font-serif text-2xl text-[var(--ink-deep)]">问云立派四愿</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {purposes.map((p, i) => (
              <div key={i} className="bg-[var(--ink-parchment)] rounded-2xl p-5 text-center border border-[var(--ink-deep)]/8 hover:border-[var(--ink-gold)]/40 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="font-serif text-lg font-medium text-[var(--ink-deep)] mb-2">{p.title}</div>
                <p className="text-xs text-[var(--ink-mid)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 七愿 */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-xs tracking-widest text-[var(--ink-gold)] mb-2">— 问 云 七 愿 —</div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {wishes.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl bg-[var(--ink-parchment)] border border-[var(--ink-deep)]/8 hover:border-[var(--ink-gold)]/40 transition-colors">
                <span className="text-2xl">{w.icon}</span>
                <span className="font-serif text-sm text-[var(--ink-deep)] font-medium">{w.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-[var(--ink-mid)] leading-relaxed">
            问心，问路，问云深处；守善，守界，守一盏灯。
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Announcements */}
          <div className="bg-[var(--ink-parchment)] rounded-2xl p-6 border border-[var(--ink-deep)]/8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--ink-gold)]" />
                <h3 className="font-serif text-base font-medium text-[var(--ink-deep)]">问云公告</h3>
              </div>
              <Link to="/announcements" className="text-xs text-[var(--ink-mid)] hover:text-[var(--ink-deep)] flex items-center gap-0.5">
                全部 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {announcements.length === 0 ? (
              <p className="text-sm text-[var(--ink-mid)]/60 text-center py-6">暂无公告</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="pb-3 border-b border-[var(--ink-deep)]/8 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      {a.is_pinned && <span className="mt-0.5 text-xs bg-[var(--ink-gold)]/15 text-[var(--ink-gold)] px-1.5 py-0.5 rounded shrink-0">置顶</span>}
                      <div>
                        <p className="text-sm text-[var(--ink-deep)] font-medium leading-snug">{a.title}</p>
                        <p className="text-xs text-[var(--ink-mid)] mt-0.5">{a.category} · {new Date(a.published_at).toLocaleDateString("zh-CN")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Members */}
          <div className="bg-[var(--ink-parchment)] rounded-2xl p-6 border border-[var(--ink-deep)]/8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--ink-gold)]" />
                <h3 className="font-serif text-base font-medium text-[var(--ink-deep)]">问云名册</h3>
              </div>
              <Link to="/members" className="text-xs text-[var(--ink-mid)] hover:text-[var(--ink-deep)] flex items-center gap-0.5">
                查看全部 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recentMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--ink-deep)]/4 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--ink-gold)]/15 flex items-center justify-center text-sm font-serif font-medium text-[var(--ink-gold)] shrink-0">
                    {m.dao_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--ink-deep)] truncate">{m.dao_name}</p>
                    <p className="text-xs text-[var(--ink-mid)] flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5" />{m.public_region || m.city || "云深处"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/members" className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--ink-deep)]/10 text-xs text-[var(--ink-mid)] hover:border-[var(--ink-gold)]/40 hover:text-[var(--ink-deep)] transition-colors">
              <Scroll className="w-3.5 h-3.5" /> 登记入册
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-[var(--ink-deep)] rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <path d="M0 200 L100 80 L200 140 L300 60 L400 100 L400 200Z" fill="white" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="font-serif text-xl text-[var(--ink-parchment)] mb-2">云深不知处</p>
              <p className="text-[var(--ink-parchment)]/60 text-sm mb-6">问心即归途</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/assessment"
                  className="px-6 py-2.5 bg-[var(--ink-gold)] text-white rounded-full text-sm font-medium hover:bg-[var(--ink-gold)]/90 transition-colors">
                  参加问心考核
                </Link>
                <Link to="/members"
                  className="px-6 py-2.5 bg-white/10 border border-white/20 text-[var(--ink-parchment)] rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
                  查看名册
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
