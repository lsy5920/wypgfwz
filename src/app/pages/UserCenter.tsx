import { useState, useEffect } from "react";
import { Link } from "react-router";
import { User, CheckCircle, Clock, X, BookOpen, Feather, ScrollText, LogIn, Settings, MapPin, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import { API, authHeaders } from "../lib/supabase";
import { AuthModal } from "../components/AuthModal";
import { adminBadgeLabel, isAdminProfile } from "../lib/permissions";

export const UserCenter = () => {
  const { user, session, profile, signOut, refreshProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editCity, setEditCity] = useState("");
  const [editBio, setEditBio] = useState("");
  const badgeLabel = adminBadgeLabel(profile);
  const canVisitAdmin = isAdminProfile(profile);

  useEffect(() => {
    // 用户切换时先清空上一位同门的状态，避免接口返回前短暂显示旧考核或旧入册信息。
    setQuizResult(null);
    setApplication(null);
    if (!user || !session) return;
    fetch(`${API}/quiz-result`, { headers: authHeaders(session.access_token) })
      .then(r => r.json()).then(d => setQuizResult(d.result));
    fetch(`${API}/my-application`, { headers: authHeaders(session.access_token) })
      .then(r => r.json()).then(d => setApplication(d.application));
  }, [user, session]);

  useEffect(() => {
    if (profile) { setEditCity(profile.city ?? ""); setEditBio(profile.bio ?? ""); }
  }, [profile]);

  const saveProfile = async () => {
    if (!session) return;
    setSaving(true);
    await fetch(`${API}/profile`, {
      method: "PUT",
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ nickname: profile?.nickname, city: editCity, bio: editBio, is_public: profile?.is_public }),
    });
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--ink-gold)]/15 flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-[var(--ink-gold)]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[var(--ink-deep)] mb-2">问云小院</h2>
        <p className="text-sm text-[var(--ink-mid)] mb-8">登录后查看您的云上小院</p>
        <Button onClick={() => setAuthOpen(true)} className="bg-[var(--ink-deep)] hover:bg-[var(--ink-mid)] text-[var(--ink-parchment)]">
          <LogIn className="w-4 h-4 mr-2" /> 登入问云
        </Button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  const appStatus = application?.status;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <User className="w-3.5 h-3.5" /> <span>问云小院</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">问云小院</h1>
      </div>

      {/* 个人资料卡片 */}
      <div className="bg-[var(--ink-parchment)] rounded-2xl p-6 border border-[var(--ink-deep)]/8 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--ink-gold)]/20 flex items-center justify-center text-2xl font-serif font-bold text-[var(--ink-gold)] shrink-0">
            {profile?.nickname?.[0] ?? "云"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-xl font-bold text-[var(--ink-deep)]">{profile?.nickname ?? "同门"}</h2>
              {badgeLabel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]">{badgeLabel}</span>
              )}
            </div>
            {profile?.city && (
              <p className="text-sm text-[var(--ink-mid)] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />{profile.city}
              </p>
            )}
            {profile?.bio && <p className="text-sm text-[var(--ink-mid)]/80 mt-1 italic">「{profile.bio}」</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="text-[var(--ink-mid)] shrink-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {editing && (
          <div className="mt-4 pt-4 border-t border-[var(--ink-deep)]/8 space-y-3">
            <div>
              <Label className="text-sm text-[var(--ink-deep)]">所在城市</Label>
              <Input value={editCity} onChange={e => setEditCity(e.target.value)}
                placeholder="如：成都、上海" className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
            </div>
            <div>
              <Label className="text-sm text-[var(--ink-deep)]">个人简介</Label>
              <Textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                placeholder="一两句话介绍自己…" rows={2}
                className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)]">取消</Button>
              <Button size="sm" disabled={saving} onClick={saveProfile} className="bg-[var(--ink-deep)] text-[var(--ink-parchment)]">
                {saving ? "保存中…" : "保存"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 状态卡片 */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* 考核状态 */}
        <div className={`rounded-2xl p-4 border flex items-center gap-4 ${quizResult?.passed
          ? "bg-[var(--ink-green)]/8 border-[var(--ink-green)]/20"
          : quizResult ? "bg-[var(--ink-gold)]/8 border-[var(--ink-gold)]/20"
            : "bg-[var(--ink-deep)]/4 border-[var(--ink-deep)]/8"
          }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${quizResult?.passed ? "bg-[var(--ink-green)]/20" : "bg-[var(--ink-deep)]/10"}`}>
            <Feather className={`w-5 h-5 ${quizResult?.passed ? "text-[var(--ink-green)]" : "text-[var(--ink-mid)]"}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--ink-deep)]">问心考核</p>
            <p className="text-xs text-[var(--ink-mid)]">
              {quizResult?.passed ? `已通过（${quizResult.score}分）`
                : quizResult ? `未通过（${quizResult.score}分），可重新考核`
                  : "尚未参加考核"}
            </p>
          </div>
          {!quizResult?.passed && (
            <Link to="/assessment">
              <Button size="sm" variant="outline" className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-xs shrink-0">
                {quizResult ? "重新考核" : "参加考核"}
              </Button>
            </Link>
          )}
        </div>

        {/* 入册状态 */}
        <div className={`rounded-2xl p-4 border flex items-center gap-4 ${appStatus === "approved"
          ? "bg-[var(--ink-green)]/8 border-[var(--ink-green)]/20"
          : appStatus === "pending" ? "bg-[var(--ink-gold)]/8 border-[var(--ink-gold)]/20"
            : appStatus === "rejected" ? "bg-red-50 border-red-200"
              : "bg-[var(--ink-deep)]/4 border-[var(--ink-deep)]/8"
          }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${appStatus === "approved" ? "bg-[var(--ink-green)]/20"
            : appStatus === "pending" ? "bg-[var(--ink-gold)]/20"
              : "bg-[var(--ink-deep)]/10"}`}>
            {appStatus === "approved" ? <CheckCircle className="w-5 h-5 text-[var(--ink-green)]" />
              : appStatus === "pending" ? <Clock className="w-5 h-5 text-[var(--ink-gold)]" />
                : appStatus === "rejected" ? <X className="w-5 h-5 text-red-400" />
                  : <ScrollText className="w-5 h-5 text-[var(--ink-mid)]" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--ink-deep)]">入册申请</p>
            <p className="text-xs text-[var(--ink-mid)]">
              {appStatus === "approved" ? "已通过审核，恭喜正式入册"
                : appStatus === "pending" ? "申请审核中，请耐心等候"
                  : appStatus === "rejected" ? "申请未通过，如有疑问联系执事"
                    : "尚未提交入册申请"}
            </p>
          </div>
          {!appStatus && quizResult?.passed && (
            <Link to="/members">
              <Button size="sm" className="bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white text-xs shrink-0">
                登记入册
              </Button>
            </Link>
          )}
          {!appStatus && !quizResult?.passed && (
            <Link to="/assessment">
              <Button size="sm" variant="outline" className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-xs shrink-0">
                先考核
              </Button>
            </Link>
          )}
        </div>

        {/* 申请详情 */}
        {application && (
          <div className="bg-[var(--ink-parchment)] rounded-2xl p-4 border border-[var(--ink-deep)]/8">
            <p className="text-sm font-medium text-[var(--ink-deep)] mb-3">申请信息</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["道名", application.dao_name],
                ["江湖名", application.jianghu_name],
                ["城市", application.city],
              ].map(([label, value]) => value && (
                <div key={label}>
                  <span className="text-[var(--ink-mid)]">{label}：</span>
                  <span className="text-[var(--ink-deep)]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/charter", icon: BookOpen, label: "立派金典" },
          { to: "/assessment", icon: Feather, label: "问心考核" },
          { to: "/members", icon: ScrollText, label: "问云名册" },
          ...(canVisitAdmin ? [{ to: "/admin", icon: Shield, label: "执事后台" }] : []),
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className="bg-[var(--ink-parchment)] rounded-2xl p-4 border border-[var(--ink-deep)]/8 hover:border-[var(--ink-gold)]/30 hover:shadow-sm transition-all text-center">
            <Icon className="w-5 h-5 text-[var(--ink-gold)] mx-auto mb-2" />
            <p className="text-xs text-[var(--ink-deep)]">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={signOut} className="text-xs text-[var(--ink-mid)]/60 hover:text-[var(--ink-mid)] transition-colors">
          离云（退出登录）
        </button>
      </div>
    </div>
  );
};
