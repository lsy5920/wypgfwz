import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Users, MapPin, Search, Scroll, CheckCircle, Clock, X, AlertCircle, LogIn } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AuthModal } from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";
import { API, anonHeaders, authHeaders } from "../lib/supabase";

const roleLabel = (role: string) => {
  if (role === "执事") return { text: "执事", cls: "bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]" };
  return { text: "同门", cls: "bg-[var(--ink-deep)]/8 text-[var(--ink-mid)]" };
};

export const MemberRegistry = () => {
  const { user, session } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // 入册表单状态
  const [form, setForm] = useState({
    dao_name: "", jianghu_name: "", real_name: "", gender: "",
    birth_month: "", city: "", contact: "", interests: "",
    declaration: "", companion_expectation: "", join_reason: "",
  });

  useEffect(() => {
    fetch(`${API}/members`, { headers: anonHeaders() })
      .then(r => r.json())
      .then(d => { setMembers(d.members ?? []); setLoading(false); });

    // 公开名册始终可浏览，下面只刷新当前登录用户的登记入口状态。
    setQuizPassed(false);
    setMyApplication(null);
    setShowForm(false);
    setSubmitSuccess(false);
    setSubmitError("");
    setEntryLoading(Boolean(user && session));

    if (user && session) {
      Promise.all([
        fetch(`${API}/quiz-result`, { headers: authHeaders(session.access_token) })
          .then(r => r.json())
          .then(d => setQuizPassed(d.result?.passed ?? false)),
        fetch(`${API}/my-application`, { headers: authHeaders(session.access_token) })
          .then(r => r.json())
          .then(d => setMyApplication(d.application)),
      ]).finally(() => setEntryLoading(false));
    }
  }, [user, session]);

  const filtered = members.filter(m =>
    !search || m.dao_name?.includes(search) || m.jianghu_name?.includes(search) || m.city?.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSubmitError("");
    if (!form.dao_name.startsWith("云")) {
      setSubmitError("道名须以“云”字开头");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`${API}/join-application`, {
      method: "POST",
      headers: authHeaders(session.access_token),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.error) { setSubmitError(data.error); return; }
    setSubmitSuccess(true);
    setMyApplication({ status: "pending", ...form });
    setShowForm(false);
  };

  const field = (key: keyof typeof form, label: string, hint?: string) => (
    <div>
      <Label className="text-[var(--ink-deep)] text-sm">
        {label} <span className="text-red-400 text-xs">*</span>
        {hint && <span className="text-[var(--ink-mid)] font-normal text-xs ml-1">{hint}</span>}
      </Label>
      <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 页面标题 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <Users className="w-3.5 h-3.5" /> <span>问云名册</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">问云名册</h1>
        <p className="mt-2 text-sm text-[var(--ink-mid)]">共 {members.length} 位同门已入册</p>
      </div>

      {/* 申请状态 */}
      {user && myApplication && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${myApplication.status === "approved"
          ? "bg-[var(--ink-green)]/10 border border-[var(--ink-green)]/20"
          : myApplication.status === "pending"
            ? "bg-[var(--ink-gold)]/10 border border-[var(--ink-gold)]/20"
            : "bg-red-50 border border-red-200"
          }`}>
          {myApplication.status === "approved" ? <CheckCircle className="w-5 h-5 text-[var(--ink-green)] shrink-0" />
            : myApplication.status === "pending" ? <Clock className="w-5 h-5 text-[var(--ink-gold)] shrink-0" />
              : <X className="w-5 h-5 text-red-400 shrink-0" />}
          <p className="text-sm text-[var(--ink-deep)]">
            {myApplication.status === "approved" ? "您的入册申请已通过，恭喜正式成为问云同门！"
              : myApplication.status === "pending" ? "您的入册申请正在审核中，请耐心等待执事审阅"
                : "您的入册申请未通过，如有疑问请联系执事"}
          </p>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--ink-green)]/10 border border-[var(--ink-green)]/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[var(--ink-green)]" />
          <p className="text-sm text-[var(--ink-deep)]">入册申请已提交，请等待执事审核</p>
        </div>
      )}

      {/* 操作栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-mid)]" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索道名、城市…"
            className="pl-9 bg-white/70 border-[var(--ink-deep)]/20" />
        </div>
        {user && entryLoading && (
          <Button disabled variant="outline" className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-sm">
            登记状态加载中…
          </Button>
        )}
        {user && !entryLoading && !myApplication && (
          quizPassed ? (
            <Button onClick={() => setShowForm(!showForm)}
              className="bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white text-sm">
              <Scroll className="w-4 h-4 mr-2" /> 登记入册
            </Button>
          ) : (
            <Link to="/assessment">
              <Button variant="outline" className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-sm">
                <AlertCircle className="w-4 h-4 mr-2" /> 先参加问心考核
              </Button>
            </Link>
          )
        )}
        {!user && (
          <Button onClick={() => setAuthOpen(true)} variant="outline"
            className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-sm">
            <LogIn className="w-4 h-4 mr-2" /> 登录后登记入册
          </Button>
        )}
      </div>
      {!user && (
        <p className="-mt-3 mb-6 text-xs text-[var(--ink-mid)]/80">公开名册可直接浏览，填写入册资料需要先登录并通过问心考核。</p>
      )}

      {/* 入册表单 */}
      {showForm && quizPassed && (
        <div className="mb-8 bg-[var(--ink-parchment)] rounded-2xl p-6 border border-[var(--ink-gold)]/30">
          <h3 className="font-serif text-lg font-medium text-[var(--ink-deep)] mb-2">登记入册</h3>
          <p className="text-xs text-[var(--ink-mid)] mb-6">以下信息将作为您的入派档案，须由执事审核后方可入册</p>
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{submitError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[var(--ink-deep)] text-sm">
                  道名 <span className="text-red-400 text-xs">*</span>
                  <span className="text-[var(--ink-gold)] text-xs ml-1">（须以"云"字开头）</span>
                </Label>
                <Input value={form.dao_name} onChange={e => setForm(f => ({ ...f, dao_name: e.target.value }))}
                  placeholder="如：云清、云晚禾" required className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
              </div>
              {field("jianghu_name", "江湖名")}
              {field("real_name", "真实姓名", "（仅执事可见）")}
              <div>
                <Label className="text-[var(--ink-deep)] text-sm">性别 <span className="text-red-400 text-xs">*</span></Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger className="mt-1 bg-white/70 border-[var(--ink-deep)]/20">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {field("birth_month", "出生年月", "（如：1995年3月）")}
              {field("city", "目前所在城市")}
              {field("contact", "联系方式", "（微信/手机，仅执事可见）")}
            </div>
            <div>
              <Label className="text-[var(--ink-deep)] text-sm">雅兴（兴趣爱好）<span className="text-red-400 text-xs">*</span></Label>
              <Input value={form.interests} onChange={e => setForm(f => ({ ...f, interests: e.target.value }))}
                placeholder="如：读书、摄影、茶艺、游历" required className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
            </div>
            <div>
              <Label className="text-[var(--ink-deep)] text-sm">宣言 <span className="text-red-400 text-xs">*</span></Label>
              <Textarea value={form.declaration} onChange={e => setForm(f => ({ ...f, declaration: e.target.value }))}
                placeholder="您的入派宣言或座右铭…" required rows={2}
                className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
            </div>
            <div>
              <Label className="text-[var(--ink-deep)] text-sm">同行期待 <span className="text-red-400 text-xs">*</span></Label>
              <Textarea value={form.companion_expectation} onChange={e => setForm(f => ({ ...f, companion_expectation: e.target.value }))}
                placeholder="您希望在问云派中与同门共同做什么…" required rows={2}
                className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
            </div>
            <div>
              <Label className="text-[var(--ink-deep)] text-sm">入派理由 <span className="text-red-400 text-xs">*</span></Label>
              <Textarea value={form.join_reason} onChange={e => setForm(f => ({ ...f, join_reason: e.target.value }))}
                placeholder="您为何想加入问云派…" required rows={3}
                className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}
                className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)]">
                取消
              </Button>
              <Button type="submit" disabled={submitting}
                className="flex-1 bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white">
                {submitting ? "提交中…" : "提交申请"}
              </Button>
            </div>
          </form>
        </div>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />

      {/* 成员列表 */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--ink-deep)]/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--ink-mid)]/60">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>未找到相关成员</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((m) => {
            const rl = roleLabel(m.member_role);
            return (
              <div key={m.id} className="bg-[var(--ink-parchment)] rounded-2xl p-4 border border-[var(--ink-deep)]/8 hover:border-[var(--ink-gold)]/30 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--ink-gold)]/15 flex items-center justify-center text-lg font-serif font-medium text-[var(--ink-gold)] shrink-0">
                    {m.dao_name?.[0]}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${rl.cls}`}>{rl.text}</span>
                </div>
                <p className="font-serif font-medium text-[var(--ink-deep)] text-sm truncate">{m.dao_name}</p>
                <p className="text-xs text-[var(--ink-mid)] truncate">{m.jianghu_name}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-[var(--ink-mid)]/70">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{m.public_region || m.city || "云深处"}</span>
                </div>
                {m.member_code && (
                  <p className="mt-1.5 text-xs text-[var(--ink-mid)]/40 font-mono">{m.member_code}</p>
                )}
                {m.motto && (
                  <p className="mt-2 text-xs text-[var(--ink-mid)]/70 line-clamp-2 leading-relaxed italic">「{m.motto}」</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
