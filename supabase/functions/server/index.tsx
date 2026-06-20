// deno-lint-ignore-file
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const adminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

const SUPER_ADMIN_NICKNAMES = new Set(["云泽"]);

const getUser = async (authHeader: string | null | undefined) => {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await adminClient().auth.getUser(token);
  if (error || !user) return null;
  return user;
};

const isAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await adminClient()
    .from("profiles")
    .select("role,nickname")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "admin" || SUPER_ADMIN_NICKNAMES.has(data?.nickname ?? "");
};

const isSectLeader = async (userId: string): Promise<boolean> => {
  const { data } = await adminClient()
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();
  return SUPER_ADMIN_NICKNAMES.has(data?.nickname ?? "");
};

const nicknameExists = async (nickname: string, excludeUserId?: string): Promise<boolean> => {
  let query = adminClient()
    .from("profiles")
    .select("id")
    .eq("nickname", nickname)
    .limit(1);
  if (excludeUserId) query = query.neq("id", excludeUserId);
  const { data } = await query;
  return Boolean(data?.length);
};

const compactObject = (input: Record<string, unknown>) => {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) output[key] = value;
  }
  return output;
};

const firstText = (values: unknown[], fallback = "") => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return fallback;
};

const normalizeMemberRole = (value: unknown, fallback = "同门") => {
  const role = String(value ?? "").trim();
  return ["同门", "执事"].includes(role) ? role : fallback;
};

const normalizeEventType = (value: unknown, fallback = "online") => {
  const type = String(value ?? "").trim();
  if (["online", "线上"].includes(type)) return "online";
  if (["offline", "线下"].includes(type)) return "offline";
  return fallback;
};

const JOIN_APPLICATION_COLUMNS = new Set([
  "id",
  "dao_name",
  "nickname",
  "contact",
  "wechat_id",
  "birth_month",
  "age_range",
  "city",
  "interests",
  "declaration",
  "join_reason",
  "reason",
  "accept_rules",
  "status",
  "admin_note",
  "reviewed_by",
  "reviewed_at",
  "created_at",
  "gender",
  "member_role",
  "generation_name",
  "member_code",
  "jianghu_name",
  "real_name",
  "user_id",
  "roster_serial",
  "public_region",
  "raw_region",
  "motto",
  "tags",
  "companion_expectation",
  "legacy_contact",
  "joined_at",
  "requested_nickname",
  "requested_legacy_contact",
  "requested_at",
  "guiyuntang_joined",
  "guiyuntang_joined_at",
  "guiyuntang_joined_by",
]);

const pickColumns = (columns: Set<string>, input: Record<string, unknown>) => {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (columns.has(key)) output[key] = value;
  }
  return compactObject(output);
};

const joinApplicationPayload = (
  source: Record<string, any>,
  extra: Record<string, unknown> = {},
) => {
  const nickname = firstText(
    [source.dao_name, source.nickname, source.requested_nickname],
    "未填写道名",
  );
  const contact = firstText(
    [source.contact, source.wechat_id, source.legacy_contact, source.requested_legacy_contact],
    "未填写",
  );
  const reason = firstText(
    [source.join_reason, source.reason, source.declaration, source.motto],
    "未填写",
  );
  const region = firstText([source.city, source.raw_region, source.public_region], "");
  const publicRegion = firstText([source.public_region, source.city, source.raw_region], region);
  const ageRange = firstText([source.birth_month, source.age_range], "");
  const motto = firstText([source.declaration, source.motto, source.join_reason, source.reason], reason);

  return pickColumns(JOIN_APPLICATION_COLUMNS, {
    user_id: source.user_id,
    dao_name: nickname,
    nickname,
    requested_nickname: source.requested_nickname,
    jianghu_name: source.jianghu_name,
    real_name: source.real_name,
    gender: firstText([source.gender], "未填写"),
    birth_month: ageRange,
    age_range: ageRange,
    city: region,
    public_region: publicRegion,
    raw_region: firstText([source.raw_region, source.city, source.public_region], region),
    contact,
    wechat_id: contact,
    legacy_contact: contact,
    requested_legacy_contact: source.requested_legacy_contact,
    interests: firstText([source.interests, source.tags], ""),
    tags: firstText([source.interests, source.tags], ""),
    declaration: motto,
    motto,
    companion_expectation: source.companion_expectation,
    join_reason: reason,
    reason,
    accept_rules: source.accept_rules ?? true,
    status: source.status ?? "pending",
    admin_note: source.admin_note,
    member_role: normalizeMemberRole(source.member_role),
    generation_name: firstText([source.generation_name], "云"),
    member_code: source.member_code,
    roster_serial: source.roster_serial,
    joined_at: source.joined_at,
    requested_at: source.requested_at,
    guiyuntang_joined: source.guiyuntang_joined ?? false,
    guiyuntang_joined_at: source.guiyuntang_joined_at,
    guiyuntang_joined_by: source.guiyuntang_joined_by,
    reviewed_by: source.reviewed_by,
    reviewed_at: source.reviewed_at,
    ...extra,
  });
};

const normalizeApplicationRecord = (item: any) => {
  if (!item) return item;
  const daoName = firstText([item.dao_name, item.nickname, item.requested_nickname], "");
  const contact = firstText([item.contact, item.wechat_id, item.legacy_contact, item.requested_legacy_contact], "");
  const birthMonth = firstText([item.birth_month, item.age_range], "");
  const interests = firstText([item.interests, item.tags], "");
  const declaration = firstText([item.declaration, item.motto], "");
  const joinReason = firstText([item.join_reason, item.reason], "");
  return {
    ...item,
    dao_name: daoName,
    nickname: firstText([item.nickname, daoName], ""),
    contact,
    birth_month: birthMonth,
    interests,
    declaration,
    join_reason: joinReason,
  };
};

const normalizeEventRecord = (item: any) => {
  if (!item) return item;
  const eventType = normalizeEventType(item.event_type ?? item.mode ?? item.type);
  return {
    ...item,
    event_date: firstText([item.event_date, item.event_time], ""),
    event_type: eventType,
    organizer: firstText([item.organizer], ""),
  };
};

const missingColumnName = (error: any) => {
  const message = String(error?.message ?? error ?? "");
  return (
    message.match(/Could not find the '([^']+)' column/)?.[1] ??
    message.match(/column "([^"]+)" .* does not exist/)?.[1] ??
    null
  );
};

const nullColumnName = (error: any) => {
  const message = String(error?.message ?? error ?? "");
  return message.match(/null value in column "([^"]+)"/)?.[1] ?? null;
};

const defaultValueForColumn = (column: string) => {
  const defaults: Record<string, unknown> = {
    nickname: "未填写道名",
    wechat_id: "未填写",
    reason: "未填写",
    accept_rules: true,
    status: "pending",
    gender: "未填写",
    member_role: "同门",
    generation_name: "云",
    guiyuntang_joined: false,
  };
  return defaults[column] ?? "";
};

const writeWithColumnFallback = async (
  input: Record<string, unknown>,
  run: (payload: Record<string, unknown>) => Promise<{ data?: any; error?: any }>,
) => {
  let payload = compactObject(input);
  for (let index = 0; index < 30; index += 1) {
    const result = await run(payload);
    if (!result.error) return result;
    const missingColumn = missingColumnName(result.error);
    if (missingColumn && Object.prototype.hasOwnProperty.call(payload, missingColumn)) {
      const nextPayload = { ...payload };
      delete nextPayload[missingColumn];
      payload = nextPayload;
      console.log(`字段 ${missingColumn} 不存在，已跳过后重试`);
      continue;
    }
    const nullColumn = nullColumnName(result.error);
    if (nullColumn) {
      payload = { ...payload, [nullColumn]: defaultValueForColumn(nullColumn) };
      console.log(`字段 ${nullColumn} 不能为空，已补默认值后重试`);
      continue;
    }
    return result;
  }
  return { data: null, error: { message: "字段兼容重试次数过多" } };
};

// 健康检查
app.get("/make-server-0e17939c/health", (c) => {
  return c.json({ status: "ok" });
});

// ── 登录注册 ─────────────────────────────────────────────────────────────────

app.post("/make-server-0e17939c/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nickname, city, bio } = body;
    if (!email || !password || !nickname) {
      return c.json({ error: "email, password, nickname required" }, 400 as any);
    }
    if (!String(nickname).startsWith("云")) {
      return c.json({ error: "道名须以「云」字开头" }, 400 as any);
    }
    const supabase = adminClient();
    if (await nicknameExists(String(nickname))) {
      return c.json({ error: "此道名已被使用，请换一个道名" }, 409 as any);
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nickname },
      email_confirm: true,
    });
    if (error) {
      console.log("signup error:", error.message);
      return c.json({ error: error.message }, 400 as any);
    }
    await supabase.from("profiles").upsert({
      id: data.user.id,
      nickname,
      city: city || null,
      bio: bio || null,
      role: "member",
      is_public: true,
    });
    return c.json({ success: true });
  } catch (e) {
    console.log("signup exception:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 个人资料 ─────────────────────────────────────────────────────────────────

app.get("/make-server-0e17939c/profile", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "unauthorized" }, 401 as any);
    const { data, error } = await adminClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ profile: data });
  } catch (e) {
    console.log("get profile error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.put("/make-server-0e17939c/profile", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "unauthorized" }, 401 as any);
    const body = await c.req.json();
    const nextNickname = String(body.nickname || "");
    if (!nextNickname.startsWith("云")) {
      return c.json({ error: "道名须以「云」字开头" }, 400 as any);
    }
    if (await nicknameExists(nextNickname, user.id)) {
      return c.json({ error: "此道名已被使用，请换一个道名" }, 409 as any);
    }
    const { error } = await adminClient()
      .from("profiles")
      .update({
        nickname: nextNickname,
        city: body.city,
        bio: body.bio,
        is_public: body.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true });
  } catch (e) {
    console.log("put profile error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 成员名册 ─────────────────────────────────────────────────────────────────

app.get("/make-server-0e17939c/members", async (c) => {
  try {
    const { data, error } = await adminClient()
      .from("roster_entries")
      .select("*")
      .eq("status", "approved")
      .order("member_code");
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ members: data });
  } catch (e) {
    console.log("get members error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 公告 ─────────────────────────────────────────────────────────────────────

app.get("/make-server-0e17939c/announcements", async (c) => {
  try {
    const { data, error } = await adminClient()
      .from("announcements")
      .select("*")
      .eq("status", "published")
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ announcements: data });
  } catch (e) {
    console.log("get announcements error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 活动 ─────────────────────────────────────────────────────────────────────

app.get("/make-server-0e17939c/events", async (c) => {
  try {
    const { data, error } = await adminClient()
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ events: (data ?? []).map(normalizeEventRecord) });
  } catch (e) {
    console.log("get events error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 考核结果 ─────────────────────────────────────────────────────────────────

app.post("/make-server-0e17939c/quiz-result", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "unauthorized" }, 401 as any);
    const body = await c.req.json();
    const score = Number(body.score ?? 0);
    const totalScore = Number(body.total_score ?? body.totalScore ?? 100);
    const passed = Boolean(body.passed);
    const singleCorrect = Number(body.single_correct ?? body.singleCorrect ?? 0);
    const multipleCorrect = Number(body.multiple_correct ?? body.multipleCorrect ?? 0);
    const answers = body.answers ?? {};
    // 线上旧表存在 total_score、single_correct、multiple_correct、answers 等字段，写入完整默认值避免静默保存失败。
    const { error } = await writeWithColumnFallback(
      {
        user_id: user.id,
        score,
        total_score: totalScore,
        passed,
        single_correct: singleCorrect,
        multiple_correct: multipleCorrect,
        answers,
        created_at: new Date().toISOString(),
      },
      (payload) => adminClient()
        .from("wenxin_quiz_results")
        .upsert(payload, { onConflict: "user_id" }),
    );
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true });
  } catch (e) {
    console.log("post quiz error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.get("/make-server-0e17939c/quiz-result", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "unauthorized" }, 401 as any);
    const { data, error } = await adminClient()
      .from("wenxin_quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ result: data });
  } catch (e) {
    console.log("get quiz error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 入册申请 ─────────────────────────────────────────────────────────────────

app.post("/make-server-0e17939c/join-application", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "unauthorized" }, 401 as any);
    const supabase = adminClient();
    // 检查是否通过问心考核
    const { data: quiz } = await supabase
      .from("wenxin_quiz_results")
      .select("passed")
      .eq("user_id", user.id)
      .eq("passed", true)
      .maybeSingle();
    if (!quiz) {
      return c.json({ error: "须先通过问心考核（80分以上）方可申请入册" }, 403 as any);
    }
    // 检查是否已经提交过申请
    const { data: existing } = await supabase
      .from("join_applications")
      .select("id,status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      return c.json({ error: "您已提交过申请", existing }, 409 as any);
    }
    const body = await c.req.json();
    if (!String(body.dao_name || "").startsWith("云")) {
      return c.json({ error: "道名须以「云」字开头" }, 400 as any);
    }
    const { data, error } = await writeWithColumnFallback(
      joinApplicationPayload({ ...body, user_id: user.id, status: "pending" }),
      (payload) => supabase
        .from("join_applications")
        .insert(payload)
        .select()
        .single(),
    );
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true, application: normalizeApplicationRecord(data) });
  } catch (e) {
    console.log("join application error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.get("/make-server-0e17939c/my-application", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "unauthorized" }, 401 as any);
    const { data, error } = await adminClient()
      .from("join_applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ application: normalizeApplicationRecord(data) });
  } catch (e) {
    console.log("my application error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

// ── 后台管理 ─────────────────────────────────────────────────────────────────

app.get("/make-server-0e17939c/admin/applications", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const { data, error } = await adminClient()
      .from("join_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ applications: (data ?? []).map(normalizeApplicationRecord) });
  } catch (e) {
    console.log("admin applications error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.put("/make-server-0e17939c/admin/applications/:id", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const id = c.req.param("id");
    const body = await c.req.json();
    const { action } = body;
    const supabase = adminClient();

    if (action === "update") {
      const nextDaoName = String(body.dao_name ?? body.nickname ?? "");
      if (!nextDaoName.startsWith("云")) {
        return c.json({ error: "道名须以「云」字开头" }, 400 as any);
      }
      const { data: currentApplication, error: currentApplicationError } = await supabase
        .from("join_applications")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (currentApplicationError) return c.json({ error: currentApplicationError.message }, 500 as any);
      if (!currentApplication) return c.json({ error: "not found" }, 404 as any);
      const { error: updateError } = await writeWithColumnFallback(
        joinApplicationPayload({
          ...currentApplication,
          ...body,
          dao_name: nextDaoName,
          nickname: nextDaoName,
          status: currentApplication.status,
          member_code: currentApplication.member_code,
        }),
        (payload) => supabase
          .from("join_applications")
          .update(payload)
          .eq("id", id),
      );
      if (updateError) return c.json({ error: updateError.message }, 500 as any);
      return c.json({ success: true });
    }

    if (action === "approve") {
      const { data: appData, error: appErr } = await supabase
        .from("join_applications")
        .select("*")
        .eq("id", id)
        .single();
      if (appErr || !appData) return c.json({ error: "not found" }, 404 as any);

      const daoName = appData.dao_name ?? appData.nickname;
      if (!String(daoName || "").startsWith("云")) {
        return c.json({ error: "道名须以「云」字开头" }, 400 as any);
      }

      const rosterFilters = [
        appData.member_code ? `member_code.eq.${appData.member_code}` : "",
        daoName ? `dao_name.eq.${daoName}` : "",
      ].filter(Boolean);
      const { data: existingRoster, error: existingRosterError } = rosterFilters.length
        ? await supabase
          .from("roster_entries")
          .select("*")
          .or(rosterFilters.join(","))
          .maybeSingle()
        : { data: null, error: null };
      if (existingRosterError) return c.json({ error: existingRosterError.message }, 500 as any);

      let memberCode = existingRoster?.member_code ?? appData.member_code;
      if (!memberCode) {
        // 生成下一个成员编号
        const { data: last } = await supabase
          .from("roster_entries")
          .select("member_code")
          .order("member_code", { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextNum = 1;
        if (last?.member_code) {
          const match = String(last.member_code).match(/(\d+)$/);
          if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        memberCode = `问云-云-${String(nextNum).padStart(3, "0")}`;
      }

      const rosterPayload = {
        dao_name: daoName,
        jianghu_name: appData.jianghu_name ?? appData.nickname,
        member_code: memberCode,
        gender: appData.gender,
        birth_month: appData.birth_month ?? appData.age_range,
        city: appData.city,
        member_role: existingRoster?.member_role ?? normalizeMemberRole(appData.member_role),
        generation_name: "云",
        public_region: appData.public_region ?? appData.city,
        motto: appData.declaration ?? appData.motto ?? appData.reason,
        tags: appData.interests ?? appData.tags,
        companion_expectation: appData.companion_expectation,
        joined_at: existingRoster?.joined_at ?? new Date().toISOString(),
        status: "approved",
      };
      const { error: rosterErr } = existingRoster?.id
        ? await writeWithColumnFallback(
          rosterPayload,
          (payload) => supabase.from("roster_entries").update(payload).eq("id", existingRoster.id),
        )
        : await writeWithColumnFallback(
          rosterPayload,
          (payload) => supabase.from("roster_entries").insert(payload),
        );
      if (rosterErr) return c.json({ error: rosterErr.message }, 500 as any);

      const { error: approveError } = await writeWithColumnFallback(
        joinApplicationPayload(appData, {
          status: "approved",
          member_code: memberCode,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        }),
        (payload) => supabase
          .from("join_applications")
          .update(payload)
          .eq("id", id),
      );
      if (approveError) return c.json({ error: approveError.message }, 500 as any);
      return c.json({ success: true, memberCode });
    }

    if (action === "reject") {
      const { data: appData } = await supabase
        .from("join_applications")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      const { error: rejectError } = await writeWithColumnFallback(
        joinApplicationPayload(appData ?? {}, {
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        }),
        (payload) => supabase
          .from("join_applications")
          .update(payload)
          .eq("id", id),
      );
      if (rejectError) return c.json({ error: rejectError.message }, 500 as any);

      const daoName = appData?.dao_name ?? appData?.nickname;
      const rosterFilters = [
        appData?.member_code ? `member_code.eq.${appData.member_code}` : "",
        daoName ? `dao_name.eq.${daoName}` : "",
      ].filter(Boolean);
      if (rosterFilters.length) {
        const { error: rosterError } = await writeWithColumnFallback(
          { status: "rejected" },
          (payload) => supabase
            .from("roster_entries")
            .update(payload)
            .or(rosterFilters.join(",")),
        );
        if (rosterError) return c.json({ error: rosterError.message }, 500 as any);
      }
      return c.json({ success: true });
    }

    return c.json({ error: "未知审核操作" }, 400 as any);
  } catch (e) {
    console.log("admin approve error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.post("/make-server-0e17939c/admin/announcements", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const body = await c.req.json();
    const slug = `wenyun-${Date.now()}`;
    const { data, error } = await adminClient()
      .from("announcements")
      .insert({
        title: body.title,
        slug,
        category: body.category || "山门公告",
        summary: body.summary || null,
        content: body.content,
        is_pinned: body.is_pinned || false,
        status: "published",
        published_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true, announcement: data });
  } catch (e) {
    console.log("post announcement error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.delete("/make-server-0e17939c/admin/announcements/:id", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const { error } = await adminClient()
      .from("announcements")
      .delete()
      .eq("id", c.req.param("id"));
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true });
  } catch (e) {
    console.log("delete announcement error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.post("/make-server-0e17939c/admin/events", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const body = await c.req.json();
    const eventType = normalizeEventType(body.event_type ?? body.mode ?? body.type);
    const eventDate = body.event_date || body.event_time || null;
    const { data, error } = await writeWithColumnFallback(
      {
        title: body.title,
        description: body.description,
        event_date: eventDate,
        event_time: eventDate,
        location: body.location || null,
        event_type: eventType,
        mode: eventType,
        type: eventType,
        status: body.status || "upcoming",
        organizer: body.organizer || null,
      },
      (payload) => adminClient()
        .from("events")
        .insert(payload)
        .select()
        .single(),
    );
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true, event: normalizeEventRecord(data) });
  } catch (e) {
    console.log("post event error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.delete("/make-server-0e17939c/admin/events/:id", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const { error } = await adminClient()
      .from("events")
      .delete()
      .eq("id", c.req.param("id"));
    if (error) return c.json({ error: error.message }, 500 as any);
    return c.json({ success: true });
  } catch (e) {
    console.log("delete event error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.get("/make-server-0e17939c/admin/all-members", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const supabase = adminClient();
    const { data: roster, error } = await supabase
      .from("roster_entries")
      .select("*")
      .eq("status", "approved")
      .order("member_code");
    if (error) return c.json({ error: error.message }, 500 as any);
    const { data: applications } = await supabase
      .from("join_applications")
      .select("*")
      .eq("status", "approved");
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,nickname,role,city,bio,is_public,created_at,updated_at");

    const normalizedApplications = (applications ?? []).map(normalizeApplicationRecord);
    const applicationByCode = new Map(normalizedApplications.map((item: any) => [item.member_code, item]));
    const applicationByDaoName = new Map(normalizedApplications.map((item: any) => [item.dao_name ?? item.nickname, item]));
    const profileById = new Map((profiles ?? []).map((item: any) => [item.id, item]));
    const profileByNickname = new Map((profiles ?? []).map((item: any) => [item.nickname, item]));

    const members = (roster ?? []).map((member: any) => {
      const application =
        applicationByCode.get(member.member_code) ??
        applicationByDaoName.get(member.dao_name) ??
        null;
      const profile =
        (application?.user_id ? profileById.get(application.user_id) : null) ??
        profileByNickname.get(member.dao_name) ??
        null;
      return {
        ...member,
        application,
        profile,
        contact: application?.contact ?? application?.legacy_contact ?? application?.wechat_id ?? null,
        real_name: application?.real_name ?? null,
        join_reason: application?.join_reason ?? application?.reason ?? null,
        declaration: application?.declaration ?? application?.motto ?? member.motto ?? null,
        interests: application?.interests ?? application?.tags ?? member.tags ?? null,
        is_sect_leader: SUPER_ADMIN_NICKNAMES.has(member.dao_name ?? profile?.nickname ?? ""),
      };
    });
    return c.json({ members, isSectLeader: await isSectLeader(user.id) });
  } catch (e) {
    console.log("admin all members error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.put("/make-server-0e17939c/admin/members/:id", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "forbidden" }, 403 as any);
    }
    const id = c.req.param("id");
    const body = await c.req.json();
    const supabase = adminClient();

    const { data: current, error: currentError } = await supabase
      .from("roster_entries")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (currentError) return c.json({ error: currentError.message }, 500 as any);
    if (!current) return c.json({ error: "not found" }, 404 as any);

    const daoName = String(body.dao_name ?? current.dao_name ?? "");
    if (!daoName.startsWith("云")) {
      return c.json({ error: "道名须以「云」字开头" }, 400 as any);
    }

    const { error: rosterError } = await writeWithColumnFallback(
      {
        dao_name: daoName,
        jianghu_name: body.jianghu_name,
        gender: body.gender,
        birth_month: body.birth_month,
        city: body.city,
        public_region: body.public_region,
        motto: body.motto,
        tags: body.tags,
        companion_expectation: body.companion_expectation,
        status: body.status,
      },
      (payload) => supabase
        .from("roster_entries")
        .update(payload)
        .eq("id", id),
    );
    if (rosterError) return c.json({ error: rosterError.message }, 500 as any);

    const { data: application } = await supabase
      .from("join_applications")
      .select("*")
      .or(`member_code.eq.${current.member_code},dao_name.eq.${current.dao_name},nickname.eq.${current.dao_name}`)
      .maybeSingle();

    if (application?.id) {
      const { error: appError } = await writeWithColumnFallback(
        joinApplicationPayload({
          ...application,
          ...body,
          dao_name: daoName,
          nickname: daoName,
          member_code: application.member_code,
          status: body.status ?? application.status,
        }),
        (payload) => supabase
          .from("join_applications")
          .update(payload)
          .eq("id", application.id),
      );
      if (appError) return c.json({ error: appError.message }, 500 as any);
    }

    if (application?.user_id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(compactObject({
          nickname: daoName,
          city: body.city,
          bio: body.motto ?? body.declaration,
          updated_at: new Date().toISOString(),
        }))
        .eq("id", application.user_id);
      if (profileError) return c.json({ error: profileError.message }, 500 as any);
    }

    return c.json({ success: true });
  } catch (e) {
    console.log("admin update member error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

app.put("/make-server-0e17939c/admin/members/:id/role", async (c) => {
  try {
    const user = await getUser(c.req.header("Authorization"));
    if (!user || !(await isSectLeader(user.id))) {
      return c.json({ error: "只有宗主可以任免执事" }, 403 as any);
    }
    const id = c.req.param("id");
    const { member_role } = await c.req.json();
    if (!["同门", "执事"].includes(member_role)) {
      return c.json({ error: "角色只能为同门或执事" }, 400 as any);
    }
    const supabase = adminClient();
    const { data: member, error: memberError } = await supabase
      .from("roster_entries")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (memberError) return c.json({ error: memberError.message }, 500 as any);
    if (!member) return c.json({ error: "not found" }, 404 as any);
    if (SUPER_ADMIN_NICKNAMES.has(member.dao_name ?? "")) {
      return c.json({ error: "宗主角色不可被修改" }, 400 as any);
    }

    const { error: rosterError } = await supabase
      .from("roster_entries")
      .update({ member_role })
      .eq("id", id);
    if (rosterError) return c.json({ error: rosterError.message }, 500 as any);

    const { data: application } = await supabase
      .from("join_applications")
      .select("id,user_id")
      .or(`member_code.eq.${member.member_code},dao_name.eq.${member.dao_name},nickname.eq.${member.dao_name}`)
      .maybeSingle();
    if (application?.id) {
      await writeWithColumnFallback(
        { requested_at: new Date().toISOString() },
        (payload) => supabase
          .from("join_applications")
          .update(payload)
          .eq("id", application.id),
      );
    }
    if (application?.user_id) {
      await supabase
        .from("profiles")
        .update({
          role: member_role === "执事" ? "admin" : "member",
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.user_id);
    }

    return c.json({ success: true, member_role });
  } catch (e) {
    console.log("admin update role error:", e);
    return c.json({ error: String(e) }, 500 as any);
  }
});

Deno.serve(app.fetch);
