import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { anonHeaders, authApi, supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  role: string;
  city: string | null;
  bio: string | null;
  is_public: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: { email: string; password: string; nickname: string; city?: string; bio?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (token: string) => {
    try {
      const data = await authApi<{ profile?: Profile }>("/profile", { token });
      if (data.profile) setProfile(data.profile);
    } catch (e) {
      console.log("fetchProfile error:", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) fetchProfile(session.access_token);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) fetchProfile(session.access_token);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (data: { email: string; password: string; nickname: string; city?: string; bio?: string }) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: anonHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.error) return { error: result.error };
    // 注册成功后自动登录，减少新同门重复输入账号密码的步骤。
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await authApi<{ profile?: Profile }>("/profile");
      if (data.profile) setProfile(data.profile);
    } catch (e) {
      console.log("refreshProfile error:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
