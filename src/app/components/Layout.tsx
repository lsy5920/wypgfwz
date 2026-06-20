import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Cloud, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../lib/permissions";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "首页" },
  { to: "/charter", label: "立派金典" },
  { to: "/announcements", label: "问云公告" },
  { to: "/activities", label: "问云雅集" },
  { to: "/members", label: "问云名册" },
  { to: "/user-center", label: "问云小院" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const canVisitAdmin = isAdminProfile(profile);

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ink-parchment)]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-[var(--ink-parchment)]/95 backdrop-blur border-b border-[var(--ink-deep)]/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* 标识 */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[var(--ink-deep)] flex items-center justify-center">
              <Cloud className="w-4 h-4 text-[var(--ink-parchment)]" />
            </div>
            <span className="font-serif font-semibold text-[var(--ink-deep)] text-lg tracking-wide">问云派</span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${isActive(to)
                  ? "text-[var(--ink-deep)] font-medium bg-[var(--ink-deep)]/8"
                  : "text-[var(--ink-mid)] hover:text-[var(--ink-deep)] hover:bg-[var(--ink-deep)]/5"
                  }`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作区 */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[var(--ink-deep)]/5 text-sm text-[var(--ink-deep)] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-[var(--ink-gold)]/20 flex items-center justify-center text-xs font-medium text-[var(--ink-gold)]">
                      {profile?.nickname?.[0] ?? "云"}
                    </div>
                    <span className="max-w-20 truncate">{profile?.nickname ?? "同门"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[var(--ink-parchment)] border-[var(--ink-deep)]/15">
                  <DropdownMenuItem asChild>
                    <Link to="/user-center" className="flex items-center gap-2 text-[var(--ink-deep)]">
                      <User className="w-4 h-4" /> 问云小院
                    </Link>
                  </DropdownMenuItem>
                  {canVisitAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 text-[var(--ink-deep)]">
                        <Cloud className="w-4 h-4" /> 执事后台
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-[var(--ink-mid)]">
                    <LogOut className="w-4 h-4" /> 离云
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button onClick={() => openAuth("login")}
                  className="px-3 py-1.5 text-sm text-[var(--ink-mid)] hover:text-[var(--ink-deep)] transition-colors">
                  登录
                </button>
                <Button onClick={() => openAuth("register")} size="sm"
                  className="bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white text-sm px-4">
                  入派
                </Button>
              </>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button className="md:hidden p-2 rounded hover:bg-[var(--ink-deep)]/5 text-[var(--ink-deep)]"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 移动端导航抽屉 */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--ink-deep)]/10 bg-[var(--ink-parchment)] px-4 py-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded text-sm ${isActive(to)
                  ? "text-[var(--ink-deep)] font-medium bg-[var(--ink-deep)]/8"
                  : "text-[var(--ink-mid)] hover:text-[var(--ink-deep)]"
                  }`}>
                {label}
              </Link>
            ))}
            {user ? (
              <>
                {canVisitAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded text-sm text-[var(--ink-mid)] hover:text-[var(--ink-deep)]">
                    执事后台
                  </Link>
                )}
                <button onClick={() => { signOut(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded text-sm text-[var(--ink-mid)] hover:text-[var(--ink-deep)]">
                  离云（退出）
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openAuth("login")} className="flex-1 border-[var(--ink-deep)]/20 text-[var(--ink-deep)]">
                  登录
                </Button>
                <Button size="sm" onClick={() => openAuth("register")} className="flex-1 bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white">
                  入派
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 页面主体 */}
      <main className="flex-1">{children}</main>

      {/* 页脚 */}
      <footer className="border-t border-[var(--ink-deep)]/10 bg-[var(--ink-deep)] text-[var(--ink-parchment)]/80 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[var(--ink-parchment)]/20 flex items-center justify-center">
                  <Cloud className="w-3.5 h-3.5 text-[var(--ink-parchment)]" />
                </div>
                <span className="font-serif font-semibold text-[var(--ink-parchment)] text-lg">问云派</span>
              </div>
              <p className="text-sm text-[var(--ink-parchment)]/60 leading-relaxed">
                以云为幕，以灯为证。<br />
                清醒温柔，同行自渡。
              </p>
            </div>
            <div>
              <div className="font-medium text-[var(--ink-parchment)]/90 mb-3 text-sm">快速导航</div>
              <div className="grid grid-cols-2 gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="text-sm text-[var(--ink-parchment)]/60 hover:text-[var(--ink-parchment)] transition-colors py-0.5">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium text-[var(--ink-parchment)]/90 mb-3 text-sm">派训四字</div>
              <div className="grid grid-cols-4 gap-2">
                {["云", "灯", "舟", "竹"].map((char) => (
                  <div key={char} className="aspect-square rounded bg-[var(--ink-parchment)]/10 flex items-center justify-center font-serif text-xl text-[var(--ink-parchment)]/70">
                    {char}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--ink-parchment)]/40 mt-3">问云派 · 二〇二六年立</p>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </div>
  );
};
