import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const API = `https://${projectId}.supabase.co/functions/v1/make-server-0e17939c`;

export const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const anonHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
});

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  requireAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status = 0, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const apiUrl = (path: string) => `${API}${path.startsWith("/") ? path : `/${path}`}`;

export const getFreshAccessToken = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) return "";
  return data.session.access_token;
};

// 统一业务接口请求：公开数据使用匿名密钥，登录数据每次取最新会话令牌，减少旧令牌导致的数据库读写失败。
export const apiRequest = async <T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const method = options.method ?? "GET";
  const token = options.token ?? (options.requireAuth ? await getFreshAccessToken() : "");
  if (options.requireAuth && !token) {
    throw new ApiError("登录状态已失效，请重新登录后再操作", 401);
  }

  const res = await fetch(apiUrl(path), {
    method,
    headers: token ? authHeaders(token) : anonHeaders(),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || data?.error) {
    throw new ApiError(data?.error || `接口请求失败（${res.status}）`, res.status, data);
  }

  return data as T;
};

export const publicApi = <T = any>(path: string) => apiRequest<T>(path);

export const authApi = <T = any>(path: string, options: Omit<ApiRequestOptions, "requireAuth"> = {}) =>
  apiRequest<T>(path, { ...options, requireAuth: true });
