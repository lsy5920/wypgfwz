import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export const AuthModal = ({ open, onClose, defaultTab = "login" }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 注册表单状态
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regNickname, setRegNickname] = useState("");
  const [regCity, setRegCity] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regNickname.startsWith("云")) {
      setError("道名（昵称）须以“云”字开头，例如：云清、云晚");
      return;
    }
    setLoading(true);
    const res = await signUp({ email: regEmail, password: regPassword, nickname: regNickname, city: regCity });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-[var(--ink-deep)]/20">
        <div className="bg-[var(--ink-parchment)]">
          {/* 顶部标题 */}
          <div className="text-center py-6 px-6 border-b border-[var(--ink-deep)]/10">
            <div className="text-2xl font-serif text-[var(--ink-deep)] mb-1">问云派</div>
            <div className="text-xs text-[var(--ink-mid)]">以云为幕，以灯为证</div>
          </div>

          {/* 登录与注册切换 */}
          <div className="flex border-b border-[var(--ink-deep)]/10">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t
                  ? "text-[var(--ink-deep)] border-b-2 border-[var(--ink-gold)]"
                  : "text-[var(--ink-mid)] hover:text-[var(--ink-deep)]"
                  }`}
              >
                {t === "login" ? "登入问云" : "加入问云"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>
            )}

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-[var(--ink-deep)] text-sm">邮箱</Label>
                  <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    type="email" placeholder="your@email.com" required
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <div>
                  <Label className="text-[var(--ink-deep)] text-sm">密码</Label>
                  <Input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    type="password" placeholder="••••••••" required
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full bg-[var(--ink-deep)] hover:bg-[var(--ink-mid)] text-[var(--ink-parchment)]">
                  {loading ? "登入中…" : "登入"}
                </Button>
                <p className="text-center text-xs text-[var(--ink-mid)]">
                  尚未入云？<button type="button" onClick={() => setTab("register")}
                    className="text-[var(--ink-gold)] hover:underline ml-1">加入问云</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="text-[var(--ink-deep)] text-sm">邮箱</Label>
                  <Input value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    type="email" placeholder="your@email.com" required
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <div>
                  <Label className="text-[var(--ink-deep)] text-sm">密码</Label>
                  <Input value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    type="password" placeholder="至少8位" required minLength={8}
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <div>
                  <Label className="text-[var(--ink-deep)] text-sm">
                    道名 <span className="text-[var(--ink-gold)] text-xs font-normal">（须以"云"字开头）</span>
                  </Label>
                  <Input value={regNickname} onChange={(e) => setRegNickname(e.target.value)}
                    placeholder="如：云清、云晚禾" required
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <div>
                  <Label className="text-[var(--ink-deep)] text-sm">所在城市 <span className="text-[var(--ink-mid)] font-normal text-xs">（选填）</span></Label>
                  <Input value={regCity} onChange={(e) => setRegCity(e.target.value)}
                    placeholder="如：成都、上海"
                    className="mt-1 bg-white/70 border-[var(--ink-deep)]/20" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white">
                  {loading ? "注册中…" : "踏入云门"}
                </Button>
                <p className="text-center text-xs text-[var(--ink-mid)]">
                  已有账号？<button type="button" onClick={() => setTab("login")}
                    className="text-[var(--ink-gold)] hover:underline ml-1">登入问云</button>
                </p>
              </form>
            )}
          </div>

          <div className="px-6 pb-4 text-center text-xs text-[var(--ink-mid)]/70">
            注册即表示您已阅读并同意《立派金典》中的各项约定
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
