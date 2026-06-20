# 问云派网站建设计划

## Context

用户要求搭建"问云派"古风社群网站，具备完整注册登录系统和多页面功能。设计风格参考设计图：水墨古风（淡雅米色底、国画山水、云/灯/舟/竹意象）。技术栈使用 React + Tailwind v4 + Supabase 数据库。

---

## 设计系统

**色彩方案**（基于设计图）：
- 背景：羊皮纸米色 `#f5f0e8`
- 主色（墨色）：深蓝墨 `#1e2d4a`
- 辅色：雾霭青 `#7a9fb5`、竹青 `#5a8a6a`
- 点缀：暖金 `#c8a55c`
- 卡片：半透明白 `rgba(255,255,255,0.7)`

**字体**：Noto Serif SC（正文衬线）+ Noto Sans SC（UI）via Google Fonts

**装饰元素**：SVG 绘制云、山、竹、灯笼、舟（内联，无需外部图片）

---

## 技术架构

### 前端结构
```
src/app/
├── App.tsx                    # 路由主入口
├── context/
│   └── AuthContext.tsx        # 全局认证状态
├── pages/
│   ├── Home.tsx               # 首页
│   ├── Charter.tsx            # 立派金典
│   ├── Announcements.tsx      # 问云公告
│   ├── Activities.tsx         # 问云雅集
│   ├── Assessment.tsx         # 问心考核
│   ├── MemberRegistry.tsx     # 问云名册（含登记入册）
│   ├── UserCenter.tsx         # 问云小院（用户中心）
│   └── AdminPanel.tsx         # 执事后台
├── components/
│   ├── Layout.tsx             # 顶栏 + 底部
│   ├── AuthModal.tsx          # 登录/注册弹窗
│   ├── ChineseDecorations.tsx # 水墨装饰 SVG 组件
│   ├── MemberCard.tsx         # 名册成员卡片
│   ├── AnnouncementCard.tsx   # 公告卡片
│   └── ActivityCard.tsx       # 活动卡片
└── lib/
    ├── supabase.ts            # Supabase 客户端
    └── assessmentQuestions.ts # 考核题库（基于立派金典）
```

### Supabase 数据库结构

**Table: profiles**
```sql
id (uuid, FK → auth.users)
username (text)          -- 江湖名
is_admin (boolean, default false)
created_at
```

**Table: member_applications**
```sql
id, user_id (FK)
jianghu_name   -- 江湖名
real_name      -- 真实姓名
birth_date     -- 出生年月
city           -- 目前所在城市
contact        -- 联系方式
dao_name       -- 道名（须以云开头）
interests      -- 雅兴（兴趣爱好）
declaration    -- 宣言
peer_expectation -- 同行期待
join_reason    -- 入派理由
status (enum: pending/approved/rejected)
member_number  -- 审核通过后生成，格式：问云-[道名]-[seq]
created_at, approved_at
```

**Table: announcements**
```sql
id, title, content, author_id, created_at
```

**Table: activities**
```sql
id, title, description, event_date, location, 
type (online/offline), status, created_at
```

**Table: assessment_results**
```sql
id, user_id, score, passed, created_at
```

**RLS Policies**:
- profiles: 本人可读写
- member_applications: 本人可读写自己的，admin 可读写所有
- announcements: 所有人可读，admin 可写
- activities: 所有人可读，admin 可写
- assessment_results: 本人可读写

**Supabase RPC** (用于生成成员编号):
```sql
get_next_member_seq() -- 返回当前最大序号+1
```

---

## 页面功能规划

### 1. 首页（Home）
- Hero Banner：问云派大标题 + 派训 + 两个按钮（阅读金典/问心考核）
- 宗旨四项（清醒自持/温良同行/修身立行/自渡渡人）图标卡片
- 问云七愿简介横向滚动
- 雅集活动预告（前2条）
- 公告预告（前3条）
- 问云名册入口（展示成员数量）

### 2. 立派金典（Charter）
- 完整显示金典19章文本
- 带目录锚点导航
- 水墨风排版，分章节折叠展开

### 3. 问云公告（Announcements）
- 公告列表，分页
- 点击展开详情

### 4. 问云雅集（Activities）
- 活动列表（线上/线下筛选）
- 活动卡片含时间、地点、类型

### 5. 问心考核（Assessment）
- 10道单选题（从金典内容中出）
- 答完提交后计分，显示得分
- ≥80分视为通过，可进入登记入册
- 未登录则提示先登录
- 已通过者显示已通过状态

### 6. 问云名册（MemberRegistry）
- 展示已通过审核的成员列表（编号+江湖名+城市+道名）
- "登记入册"按钮：检查是否登录 + 是否通过考核
- 登记表单：10个必填字段，道名校验（以云开头）
- 提交后状态：待审核

### 7. 问云小院（UserCenter）
- 用户信息展示
- 考核状态（未考/已通过/未通过）
- 入册申请状态（未申请/待审核/已通过/已拒绝）
- 登录/注册入口（未登录时）

### 8. 执事后台（AdminPanel）
- 仅 admin 可见
- 审核入册申请列表（通过/拒绝）
- 通过时自动生成编号
- 管理公告（新增/删除）
- 管理活动（新增/删除）

---

## 考核题库（10题，来自立派金典）

1. 问云派八字派训是什么？（清醒温柔，同行自渡）
2. 问云四象包括哪四个？（云、灯、舟、竹）
3. 问云三不立指的是？（不立神坛/不售焦虑/不替专业）
4. 入派道名须以哪个字开头？（云）
5. 问云七愿中，第一愿是什么？（真诚）
6. 群中十禁第一禁是什么？（违法违规内容）
7. 问云言谈四可四不可中，"可倾听"对应什么不可？（不审判）
8. 问云派以哪个字命名，象征自由与包容？（云）
9. 入派礼词"我入问云"的最后一句是？（于云深处，同行自渡）
10. 问云派结语：愿此派立于人间烟火，不失什么？（山河诗意）

---

## 实施步骤

### Step 1：Supabase 配置
1. 调用 `make:supabase` skill 引导用户连接 Supabase
2. 在 `src/app/lib/supabase.ts` 初始化客户端（使用环境变量）
3. 创建数据库表（提供 SQL 迁移脚本）

### Step 2：全局样式与字体
1. 在 `src/styles/fonts.css` 添加 Google Fonts（Noto Serif SC + Noto Sans SC）
2. 在 `src/styles/theme.css` 覆盖色彩 token 为古风配色

### Step 3：核心组件
1. `Layout.tsx`：顶部导航（响应式）+ 底部
2. `AuthModal.tsx`：登录/注册弹窗
3. `AuthContext.tsx`：全局 auth 状态
4. `ChineseDecorations.tsx`：内联 SVG 装饰

### Step 4：页面实现（按优先级）
Home → Charter → Assessment → MemberRegistry → Announcements → Activities → UserCenter → AdminPanel

### Step 5：路由配置
在 `App.tsx` 用 React Router v7 配置所有路由

---

## 关键文件

**修改的文件**：
- `src/app/App.tsx` — 路由主入口
- `src/styles/theme.css` — 古风配色覆盖
- `src/styles/fonts.css` — 添加中文字体

**新建的文件**：
- `src/app/context/AuthContext.tsx`
- `src/app/lib/supabase.ts`
- `src/app/lib/assessmentQuestions.ts`
- `src/app/pages/Home.tsx`
- `src/app/pages/Charter.tsx`
- `src/app/pages/Announcements.tsx`
- `src/app/pages/Activities.tsx`
- `src/app/pages/Assessment.tsx`
- `src/app/pages/MemberRegistry.tsx`
- `src/app/pages/UserCenter.tsx`
- `src/app/pages/AdminPanel.tsx`
- `src/app/components/Layout.tsx`
- `src/app/components/AuthModal.tsx`
- `src/app/components/ChineseDecorations.tsx`

---

## 验证方式

1. 在预览中查看首页水墨风格渲染效果
2. 测试注册/登录流程
3. 测试考核题目（答对8题以上显示通过）
4. 测试入册表单提交（道名须以云开头校验）
5. 测试管理员后台审核流程（需先在 Supabase 手动设置 is_admin=true）
6. 检查移动端和桌面端响应式布局

---

## 注意事项

- **Supabase 优先**：需先引导用户连接 Supabase 项目后才能实现完整功能；在连接前可实现静态/本地 mock 版本
- **道名校验**：前端 + 数据库层双重校验道名必须以"云"开头
- **成员编号生成**：在 Supabase RPC 中原子操作，避免并发问题
- **管理员权限**：通过 Supabase profiles.is_admin 字段控制，不暴露前端
