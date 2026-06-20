import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle, X, Plus, Trash2, AlertTriangle, Users, Bell, CalendarDays, Shield, Eye, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useAuth } from "../context/AuthContext";
import { API, authHeaders } from "../lib/supabase";
import { isAdminProfile, isSectLeaderProfile } from "../lib/permissions";

type AdminTab = "applications" | "announcements" | "events" | "members";

const valueOf = (item: any, keys: string[]) => {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
};

const showValue = (value: any) => {
  if (value === undefined || value === null || String(value).trim() === "") return "—";
  return String(value);
};

const applicationToForm = (application: any) => ({
  dao_name: valueOf(application, ["dao_name", "nickname"]),
  jianghu_name: valueOf(application, ["jianghu_name"]),
  real_name: valueOf(application, ["real_name"]),
  gender: valueOf(application, ["gender"]),
  birth_month: valueOf(application, ["birth_month", "age_range"]),
  city: valueOf(application, ["city", "raw_region", "public_region"]),
  public_region: valueOf(application, ["public_region", "city"]),
  contact: valueOf(application, ["contact", "legacy_contact", "wechat_id"]),
  interests: valueOf(application, ["interests", "tags"]),
  tags: valueOf(application, ["tags", "interests"]),
  declaration: valueOf(application, ["declaration", "motto"]),
  motto: valueOf(application, ["motto", "declaration"]),
  companion_expectation: valueOf(application, ["companion_expectation"]),
  join_reason: valueOf(application, ["join_reason", "reason"]),
  admin_note: valueOf(application, ["admin_note"]),
});

const memberToForm = (member: any) => ({
  dao_name: valueOf(member, ["dao_name"]),
  jianghu_name: valueOf(member, ["jianghu_name"]),
  real_name: valueOf(member, ["real_name"]),
  gender: valueOf(member, ["gender"]),
  birth_month: valueOf(member, ["birth_month"]),
  city: valueOf(member, ["city"]),
  public_region: valueOf(member, ["public_region"]),
  contact: valueOf(member, ["contact"]),
  interests: valueOf(member, ["interests", "tags"]),
  tags: valueOf(member, ["tags", "interests"]),
  declaration: valueOf(member, ["declaration", "motto"]),
  motto: valueOf(member, ["motto", "declaration"]),
  companion_expectation: valueOf(member, ["companion_expectation"]),
  join_reason: valueOf(member, ["join_reason"]),
  admin_note: valueOf(member?.application, ["admin_note"]),
  member_role: valueOf(member, ["member_role"]) || "同门",
  status: valueOf(member, ["status"]) || "approved",
});

const statusLabel = (status: string) => {
  if (status === "pending") return "待审核";
  if (status === "approved") return "已通过";
  if (status === "rejected") return "已拒绝";
  return status || "—";
};

export const AdminPanel = () => {
  const { user, session, profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>("applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annForm, setAnnForm] = useState({ title: "", category: "山门公告", content: "", summary: "", is_pinned: false });
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [evForm, setEvForm] = useState({ title: "", description: "", event_date: "", location: "", event_type: "online", status: "upcoming", organizer: "" });
  const [showEvForm, setShowEvForm] = useState(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [applicationForm, setApplicationForm] = useState(applicationToForm(null));
  const [memberForm, setMemberForm] = useState(memberToForm(null));
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const isAdmin = isAdminProfile(profile);
  const isSectLeader = isSectLeaderProfile(profile);

  useEffect(() => {
    if (!isAdmin || !session) return;
    loadAll();
  }, [isAdmin, session]);

  const loadAll = async () => {
    if (!session) return;
    const h = authHeaders(session.access_token);
    const [appRes, annRes, evRes, memRes] = await Promise.all([
      fetch(`${API}/admin/applications`, { headers: h }).then(r => r.json()),
      fetch(`${API}/announcements`, { headers: h }).then(r => r.json()),
      fetch(`${API}/events`, { headers: h }).then(r => r.json()),
      fetch(`${API}/admin/all-members`, { headers: h }).then(r => r.json()),
    ]);
    setApplications(appRes.applications ?? []);
    setAnnouncements(annRes.announcements ?? []);
    setEvents(evRes.events ?? []);
    setAllMembers(memRes.members ?? []);
  };

  const handleApplication = async (id: string, action: "approve" | "reject") => {
    if (!session) return;
    const res = await fetch(`${API}/admin/applications/${id}`, {
      method: "PUT",
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg(action === "approve" ? `已审核通过，编号：${data.memberCode}` : "已拒绝");
    await loadAll();
  };

  const updateApplicationDraft = async () => {
    if (!session || !editingApplication) return { error: "没有正在查看的申请资料" };
    const res = await fetch(`${API}/admin/applications/${editingApplication.id}`, {
      method: "PUT",
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ action: "update", ...applicationForm }),
    });
    return res.json();
  };

  const openApplicationEdit = (application: any) => {
    setEditingApplication(application);
    setApplicationForm(applicationToForm(application));
  };

  const openMemberEdit = (member: any) => {
    setEditingMember(member);
    setMemberForm(memberToForm(member));
  };

  const saveApplication = async () => {
    if (!session || !editingApplication) return;
    setSaving(true);
    const data = await updateApplicationDraft();
    setSaving(false);
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg("申请资料已保存");
    setEditingApplication(null);
    await loadAll();
  };

  const reviewEditingApplication = async (action: "approve" | "reject") => {
    if (!session || !editingApplication) return;
    setSaving(true);
    if (action === "approve") {
      const updateData = await updateApplicationDraft();
      if (updateData.error) {
        setSaving(false);
        setActionMsg(`错误：${updateData.error}`);
        return;
      }
    }
    const res = await fetch(`${API}/admin/applications/${editingApplication.id}`, {
      method: "PUT",
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg(action === "approve" ? `已审核通过，编号：${data.memberCode}` : "已标记为未通过");
    setEditingApplication(null);
    await loadAll();
  };

  const saveMember = async () => {
    if (!session || !editingMember) return;
    setSaving(true);
    const res = await fetch(`${API}/admin/members/${editingMember.id}`, {
      method: "PUT",
      headers: authHeaders(session.access_token),
      body: JSON.stringify(memberForm),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg("成员资料已保存");
    setEditingMember(null);
    await loadAll();
  };

  const updateMemberRole = async (member: any, nextRole: "同门" | "执事") => {
    if (!session) return;
    const res = await fetch(`${API}/admin/members/${member.id}/role`, {
      method: "PUT",
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ member_role: nextRole }),
    });
    const data = await res.json();
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg(nextRole === "执事" ? "已任命为执事" : "已撤销执事身份");
    await loadAll();
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch(`${API}/admin/announcements`, {
      method: "POST",
      headers: authHeaders(session.access_token),
      body: JSON.stringify(annForm),
    });
    const data = await res.json();
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg("公告发布成功");
    setShowAnnForm(false);
    setAnnForm({ title: "", category: "山门公告", content: "", summary: "", is_pinned: false });
    await loadAll();
  };

  const handleAnnDelete = async (id: string) => {
    if (!session || !confirm("确认删除此公告？")) return;
    await fetch(`${API}/admin/announcements/${id}`, { method: "DELETE", headers: authHeaders(session.access_token) });
    setActionMsg("公告已删除");
    await loadAll();
  };

  const handleEvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch(`${API}/admin/events`, {
      method: "POST",
      headers: authHeaders(session.access_token),
      body: JSON.stringify(evForm),
    });
    const data = await res.json();
    if (data.error) { setActionMsg(`错误：${data.error}`); return; }
    setActionMsg("活动发布成功");
    setShowEvForm(false);
    setEvForm({ title: "", description: "", event_date: "", location: "", event_type: "online", status: "upcoming", organizer: "" });
    await loadAll();
  };

  const handleEvDelete = async (id: string) => {
    if (!session || !confirm("确认删除此活动？")) return;
    await fetch(`${API}/admin/events/${id}`, { method: "DELETE", headers: authHeaders(session.access_token) });
    setActionMsg("活动已删除");
    await loadAll();
  };

  if (!user) return (
    <div className="flex items-center justify-center py-32 text-[var(--ink-mid)]">
      请先<Link to="/user-center" className="text-[var(--ink-gold)] mx-1">登录</Link>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center py-32 text-[var(--ink-mid)]">
      <AlertTriangle className="w-12 h-12 mb-4 opacity-30" />
      <p>此页面仅限执事访问</p>
    </div>
  );

  const tabs: { key: AdminTab; label: string; icon: any; count?: number }[] = [
    { key: "applications", label: "入册申请", icon: CheckCircle, count: applications.filter(a => a.status === "pending").length },
    { key: "announcements", label: "公告管理", icon: Bell, count: announcements.length },
    { key: "events", label: "活动管理", icon: CalendarDays, count: events.length },
    { key: "members", label: "全体成员", icon: Users, count: allMembers.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <Shield className="w-3.5 h-3.5" /> <span>执事后台</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">执事后台</h1>
        <Link to="/user-center" className="inline-flex items-center justify-center mt-4 text-xs text-[var(--ink-mid)] hover:text-[var(--ink-deep)]">
          返回问云小院
        </Link>
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 bg-[var(--ink-green)]/10 border border-[var(--ink-green)]/20 rounded-xl text-sm text-[var(--ink-deep)] flex items-center justify-between">
          {actionMsg}
          <button onClick={() => setActionMsg("")} className="text-[var(--ink-mid)]"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex gap-1 bg-[var(--ink-deep)]/5 rounded-xl p-1 mb-6">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${tab === key
              ? "bg-[var(--ink-parchment)] text-[var(--ink-deep)] shadow-sm"
              : "text-[var(--ink-mid)] hover:text-[var(--ink-deep)]"
              }`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            {count !== undefined && count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === key ? "bg-[var(--ink-gold)]/20 text-[var(--ink-gold)]" : "bg-[var(--ink-deep)]/10 text-[var(--ink-mid)]"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "applications" && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-16 text-[var(--ink-mid)]/60">暂无申请</div>
          ) : applications.map((app) => {
            const form = applicationToForm(app);
            return (
              <div key={app.id} className={`bg-[var(--ink-parchment)] rounded-2xl p-5 border ${app.status === "pending" ? "border-[var(--ink-gold)]/30" : "border-[var(--ink-deep)]/8"}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-medium text-[var(--ink-deep)]">{form.dao_name || "未填写道名"}</span>
                      <span className="text-xs text-[var(--ink-mid)]">（{showValue(form.jianghu_name)}）</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${app.status === "pending" ? "bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]"
                        : app.status === "approved" ? "bg-[var(--ink-green)]/15 text-[var(--ink-green)]"
                          : "bg-red-50 text-red-500"}`}>
                        {statusLabel(app.status)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink-mid)] mt-1">{showValue(form.city)} · {showValue(form.gender)} · {showValue(form.birth_month)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openApplicationEdit(app)}
                      className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" /> 查看
                    </Button>
                    {app.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => handleApplication(app.id, "approve")}
                          className="bg-[var(--ink-green)] hover:bg-[var(--ink-green)]/90 text-white text-xs">通过</Button>
                        <Button size="sm" variant="outline" onClick={() => handleApplication(app.id, "reject")}
                          className="border-red-300 text-red-500 hover:bg-red-50 text-xs">拒绝</Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-[var(--ink-mid)]">
                  <p><span className="text-[var(--ink-deep)]/60">联系方式：</span>{showValue(form.contact)}</p>
                  <p><span className="text-[var(--ink-deep)]/60">雅兴：</span>{showValue(form.interests)}</p>
                  <p><span className="text-[var(--ink-deep)]/60">入派理由：</span>{showValue(form.join_reason)}</p>
                </div>
                <p className="text-[var(--ink-mid)]/40 mt-2 text-xs">{app.created_at ? new Date(app.created_at).toLocaleDateString("zh-CN") : "—"}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "announcements" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAnnForm(!showAnnForm)} className="bg-[var(--ink-deep)] text-[var(--ink-parchment)] text-sm">
              <Plus className="w-4 h-4 mr-2" /> 发布公告
            </Button>
          </div>
          {showAnnForm && (
            <form onSubmit={handleAnnSubmit} className="bg-[var(--ink-parchment)] rounded-2xl p-5 border border-[var(--ink-gold)]/30 mb-4 space-y-3">
              <div>
                <Label className="text-sm text-[var(--ink-deep)]">标题</Label>
                <Input value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                  required className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
              </div>
              <div>
                <Label className="text-sm text-[var(--ink-deep)]">分类</Label>
                <Select value={annForm.category} onValueChange={v => setAnnForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1 bg-white/70 border-[var(--ink-deep)]/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["山门公告", "雅集通知", "同门须知"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-[var(--ink-deep)]">内容</Label>
                <Textarea value={annForm.content} onChange={e => setAnnForm(f => ({ ...f, content: e.target.value }))}
                  required rows={4} className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAnnForm(false)} className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)]">取消</Button>
                <Button type="submit" className="bg-[var(--ink-gold)] text-white">发布</Button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="bg-[var(--ink-parchment)] rounded-2xl p-4 border border-[var(--ink-deep)]/8 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--ink-deep)]">{a.title}</p>
                  <p className="text-xs text-[var(--ink-mid)] mt-0.5">{a.category} · {new Date(a.published_at || a.created_at).toLocaleDateString("zh-CN")}</p>
                </div>
                <button onClick={() => handleAnnDelete(a.id)} className="text-red-400 hover:text-red-600 shrink-0 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "events" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowEvForm(!showEvForm)} className="bg-[var(--ink-deep)] text-[var(--ink-parchment)] text-sm">
              <Plus className="w-4 h-4 mr-2" /> 发布活动
            </Button>
          </div>
          {showEvForm && (
            <form onSubmit={handleEvSubmit} className="bg-[var(--ink-parchment)] rounded-2xl p-5 border border-[var(--ink-gold)]/30 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-sm text-[var(--ink-deep)]">活动名称</Label>
                  <Input value={evForm.title} onChange={e => setEvForm(f => ({ ...f, title: e.target.value }))}
                    required className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <div>
                  <Label className="text-sm text-[var(--ink-deep)]">活动时间</Label>
                  <Input type="datetime-local" value={evForm.event_date} onChange={e => setEvForm(f => ({ ...f, event_date: e.target.value }))}
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <div>
                  <Label className="text-sm text-[var(--ink-deep)]">地点/平台</Label>
                  <Input value={evForm.location} onChange={e => setEvForm(f => ({ ...f, location: e.target.value }))}
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
              </div>
              <div>
                <Label className="text-sm text-[var(--ink-deep)]">活动介绍</Label>
                <Textarea value={evForm.description} onChange={e => setEvForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEvForm(false)} className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)]">取消</Button>
                <Button type="submit" className="bg-[var(--ink-gold)] text-white">发布</Button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-10 text-[var(--ink-mid)]/60 text-sm">暂无活动</div>
            ) : events.map(ev => (
              <div key={ev.id} className="bg-[var(--ink-parchment)] rounded-2xl p-4 border border-[var(--ink-deep)]/8 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--ink-deep)]">{ev.title}</p>
                  <p className="text-xs text-[var(--ink-mid)] mt-0.5">
                    {ev.event_type === "online" ? "线上" : "线下"} · {ev.location || "—"}
                    {ev.event_date && ` · ${new Date(ev.event_date).toLocaleDateString("zh-CN")}`}
                  </p>
                </div>
                <button onClick={() => handleEvDelete(ev.id)} className="text-red-400 hover:text-red-600 shrink-0 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "members" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[var(--ink-mid)]">共 {allMembers.length} 位同门</p>
            {isSectLeader && <p className="text-xs text-[var(--ink-gold)]">宗主可任免执事</p>}
          </div>

          <div className="space-y-3 md:hidden">
            {allMembers.map(m => (
              <div key={m.id} className="bg-[var(--ink-parchment)] rounded-2xl p-4 border border-[var(--ink-deep)]/8">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-serif font-medium text-[var(--ink-deep)] truncate">{m.dao_name || "未填写道名"}</p>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${m.is_sect_leader ? "bg-[var(--ink-gold)]/20 text-[var(--ink-gold)]" : m.member_role === "执事" ? "bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]" : "bg-[var(--ink-deep)]/8 text-[var(--ink-mid)]"}`}>
                        {m.is_sect_leader ? "宗主" : m.member_role}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[var(--ink-mid)]/70">{m.member_code || "暂无编号"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <p className="text-[var(--ink-mid)]/60">江湖名</p>
                    <p className="mt-1 text-[var(--ink-deep)] break-words">{m.jianghu_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--ink-mid)]/60">城市</p>
                    <p className="mt-1 text-[var(--ink-deep)] break-words">{m.city || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[var(--ink-mid)]/60">入册时间</p>
                    <p className="mt-1 text-[var(--ink-deep)]">{m.joined_at ? new Date(m.joined_at).toLocaleDateString("zh-CN") : "—"}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openMemberEdit(m)}
                    className="flex-1 border-[var(--ink-deep)]/20 text-[var(--ink-mid)] text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" /> 查看
                  </Button>
                  {isSectLeader && !m.is_sect_leader && (
                    <Button size="sm" variant="outline" onClick={() => updateMemberRole(m, m.member_role === "执事" ? "同门" : "执事")}
                      className="flex-1 border-[var(--ink-gold)]/30 text-[var(--ink-gold)] text-xs">
                      <Crown className="w-3.5 h-3.5 mr-1" /> {m.member_role === "执事" ? "撤销执事" : "任命执事"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs">
              <thead>
                <tr className="border-b border-[var(--ink-deep)]/10">
                  {["编号", "道名", "江湖名", "城市", "角色", "入册时间", "操作"].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-[var(--ink-mid)] font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allMembers.map(m => (
                  <tr key={m.id} className="border-b border-[var(--ink-deep)]/5 hover:bg-[var(--ink-deep)]/3">
                    <td className="py-2 pr-4 font-mono text-[var(--ink-mid)]/70 whitespace-nowrap">{m.member_code}</td>
                    <td className="py-2 pr-4 font-serif font-medium text-[var(--ink-deep)] whitespace-nowrap">{m.dao_name}</td>
                    <td className="py-2 pr-4 text-[var(--ink-mid)] whitespace-nowrap">{m.jianghu_name}</td>
                    <td className="py-2 pr-4 text-[var(--ink-mid)] whitespace-nowrap">{m.city || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-1.5 py-0.5 rounded-full ${m.is_sect_leader ? "bg-[var(--ink-gold)]/20 text-[var(--ink-gold)]" : m.member_role === "执事" ? "bg-[var(--ink-gold)]/15 text-[var(--ink-gold)]" : "bg-[var(--ink-deep)]/8 text-[var(--ink-mid)]"}`}>
                        {m.is_sect_leader ? "宗主" : m.member_role}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[var(--ink-mid)]/60 whitespace-nowrap">{m.joined_at ? new Date(m.joined_at).toLocaleDateString("zh-CN") : "—"}</td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button onClick={() => openMemberEdit(m)} className="p-1 rounded hover:bg-[var(--ink-deep)]/8 text-[var(--ink-mid)]" title="查看">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isSectLeader && !m.is_sect_leader && (
                          <button onClick={() => updateMemberRole(m, m.member_role === "执事" ? "同门" : "执事")}
                            className="p-1 rounded hover:bg-[var(--ink-gold)]/10 text-[var(--ink-gold)]"
                            title={m.member_role === "执事" ? "撤销执事" : "任命执事"}>
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditDialog
        title="查看申请资料"
        open={Boolean(editingApplication)}
        onOpenChange={() => setEditingApplication(null)}
        form={applicationForm}
        setForm={setApplicationForm}
        saving={saving}
        onSave={saveApplication}
        applicationStatus={editingApplication?.status}
        onApprove={() => reviewEditingApplication("approve")}
        onReject={() => reviewEditingApplication("reject")}
      />

      <EditDialog
        title="查看成员资料"
        open={Boolean(editingMember)}
        onOpenChange={() => setEditingMember(null)}
        form={memberForm}
        setForm={setMemberForm}
        saving={saving}
        onSave={saveMember}
      />
    </div>
  );
};

const EditDialog = ({
  title,
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  onSave,
  applicationStatus,
  onApprove,
  onReject,
}: {
  title: string;
  open: boolean;
  onOpenChange: () => void;
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  onSave: () => void;
  applicationStatus?: string;
  onApprove?: () => void;
  onReject?: () => void;
}) => {
  const update = (key: string, value: string) => setForm((prev: any) => ({ ...prev, [key]: value }));
  const isApplicationDialog = Boolean(onApprove && onReject);
  const inputFields = [
    ["dao_name", "道名"],
    ["jianghu_name", "江湖名"],
    ["real_name", "真实姓名"],
    ["gender", "性别"],
    ["birth_month", "出生年月"],
    ["city", "城市"],
    ["public_region", "公开地区"],
    ["contact", "联系方式"],
  ];
  const textareaFields = [
    ["interests", "雅兴"],
    ["declaration", "宣言"],
    ["companion_expectation", "同行期待"],
    ["join_reason", "入派理由"],
    ["admin_note", "管理备注"],
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-[var(--ink-parchment)] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-serif text-[var(--ink-deep)]">{title}</DialogTitle>
        </DialogHeader>

        {isApplicationDialog && (
          <div className="mx-6 rounded-xl border border-[var(--ink-gold)]/25 bg-[var(--ink-gold)]/8 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[var(--ink-mid)]">当前审核状态</p>
                <p className="mt-1 text-sm font-medium text-[var(--ink-deep)]">{statusLabel(applicationStatus || "pending")}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" disabled={saving || applicationStatus === "approved"} onClick={onApprove} className="bg-[var(--ink-green)] hover:bg-[var(--ink-green)]/90 text-white">
                  审核通过
                </Button>
                <Button type="button" disabled={saving || applicationStatus === "rejected"} variant="outline" onClick={onReject} className="border-red-300 text-red-500 hover:bg-red-50">
                  未通过
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inputFields.map(([key, label]) => (
              <div key={key}>
                <Label className="text-sm text-[var(--ink-deep)]">{label}</Label>
                <Input value={form[key] ?? ""} onChange={e => update(key, e.target.value)}
                  className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
              </div>
            ))}
          </div>
          {"status" in form && (
            <div className="mt-3">
              <Label className="text-sm text-[var(--ink-deep)]">名册状态</Label>
              <Select value={form.status || "approved"} onValueChange={value => update("status", value)}>
                <SelectTrigger className="mt-1 bg-white/70 border-[var(--ink-deep)]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">审核通过</SelectItem>
                  <SelectItem value="rejected">未通过</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-3 mt-3">
            {textareaFields.map(([key, label]) => (
              <div key={key}>
                <Label className="text-sm text-[var(--ink-deep)]">{label}</Label>
                <Textarea value={form[key] ?? ""} onChange={e => update(key, e.target.value)}
                  rows={2} className="mt-1 bg-white/70 border-[var(--ink-deep)]/20 resize-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--ink-deep)]/10 bg-[var(--ink-parchment)] px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" onClick={onOpenChange} className="border-[var(--ink-deep)]/20 text-[var(--ink-mid)]">取消</Button>
          <Button type="button" disabled={saving} onClick={onSave} className="bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white">
            {saving ? "保存中…" : "保存修改"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
