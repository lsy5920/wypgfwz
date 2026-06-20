# 问云派网站

## 项目介绍

问云派网站是一个基于 React、Vite、Supabase 的门派社群网站，用于展示门派首页、立派金典、公告活动、问心考核、成员名册、用户中心和执事后台。

## 环境要求

请先确认电脑或部署平台满足以下要求：

1. 本地系统建议使用 Windows 10 或 Windows 11。
2. 本地开发建议使用 Node.js 22.16.0 或更高的 22 系列版本。
3. 本地开发建议使用 npm 10.9.2 或更高版本。
4. 云端部署使用 Cloudflare Pages，构建镜像建议选择版本 3。
5. 源码托管使用 GitHub 仓库，Cloudflare Pages 绑定该仓库后自动拉取源码构建部署。
6. 浏览器建议使用最新版 Chrome、Edge 或 Firefox。

项目依赖版本已经固定在 `package.json` 和 `package-lock.json` 中，常用核心依赖如下：

1. React：18.3.1。
2. React DOM：18.3.1。
3. Vite：6.3.5。
4. Tailwind CSS：4.1.12。
5. React Router：7.13.0。
6. Supabase：2.108.1。

## 安装部署教程

### 本地首次运行

以下步骤适合第一次在 Windows 本机运行项目。

1. 打开 Windows 终端或 PowerShell。
2. 进入项目目录：

```powershell
cd C:\Users\lanshiy\Documents\小亦伟大工程\wypgfwz
```

3. 安装项目依赖：

```powershell
npm install
```

4. 启动本地开发服务：

```powershell
npm run dev
```

5. 终端出现本地访问地址后，在浏览器打开：

```text
http://127.0.0.1:5173/
```

6. 如需提前检查生产构建是否正常，执行：

```powershell
npm run build
```

7. 构建成功后，生产文件会生成到 `dist` 目录。

8. 如需本地预览生产构建，执行：

```powershell
npm run preview
```

### 上传源码到 GitHub

上传仓库时只需要提交源码和配置文件，不需要提交本地依赖和构建产物。

1. 确认项目根目录已经包含 `.gitignore`，它会自动忽略 `node_modules`、`dist`、本地日志、`.tools` 和 Supabase 临时文件。
2. 如果项目还没有初始化 Git，请在项目根目录执行：

```powershell
git init
```

3. 添加全部需要提交的文件：

```powershell
git add .
```

4. 提交本次代码：

```powershell
git commit -m "适配 Cloudflare Pages 部署"
```

5. 在 GitHub 新建一个空仓库，然后按 GitHub 页面提示绑定远程仓库并推送。示例命令如下，实际地址请换成自己的仓库地址：

```powershell
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 绑定 Cloudflare Pages 自动部署

Cloudflare Pages 会从 GitHub 仓库拉取源码，自动安装依赖、执行构建命令，并发布 `dist` 目录。

1. 登录 Cloudflare 控制台。
2. 进入 Workers 与 Pages。
3. 选择创建应用。
4. 选择 Pages。
5. 选择连接到 Git。
6. 授权并选择刚刚上传的 GitHub 仓库。
7. 构建配置按下面填写：

```text
框架预设：Vite
构建命令：npm run build
构建输出目录：dist
根目录：/
```

8. 环境变量建议填写：

```text
NODE_VERSION=22.16.0
```

9. 保存并部署。
10. 以后只要把代码推送到 GitHub 主分支，Cloudflare Pages 就会自动重新构建并发布。

本项目不再提交 `wrangler.toml`。原因是 Cloudflare Pages 的配置文件不支持填写构建命令，容易导致平台读取配置文件后跳过构建步骤。请统一在 Cloudflare Pages 控制台填写构建命令和输出目录。

注意：`npm run build` 必须在 Cloudflare Pages 控制台的构建设置里填写。如果控制台构建命令为空，Cloudflare 会跳过构建步骤，随后因为找不到 `dist` 目录而部署失败。

### 部署 Supabase 后端函数

Cloudflare Pages 负责部署前端静态页面，公告、活动、登录、成员名册和后台管理仍然访问 Supabase 后端函数。

项目的后台业务代码位于 `supabase/functions/server/index.tsx`，线上访问入口位于 `supabase/functions/make-server-0e17939c/index.ts`。部署前需要准备 Supabase 平台访问令牌。该令牌通常以 `sbp_` 开头，不是项目的公开匿名密钥，也不是数据库 `service_role` 密钥。

1. 将 Supabase CLI 解压到项目本地工具目录后，可先检查版本：

```powershell
.\.tools\supabase\supabase.exe --version
```

2. 设置平台访问令牌：

```powershell
$env:SUPABASE_ACCESS_TOKEN="你的_supabase_平台访问令牌"
```

3. 部署后端函数：

```powershell
.\.tools\supabase\supabase.exe functions deploy make-server-0e17939c --project-ref bauvdyyrtobyxhamjiwk
```

4. 部署完成后，前端会继续通过以下地址访问后端接口：

```text
https://bauvdyyrtobyxhamjiwk.supabase.co/functions/v1/make-server-0e17939c
```

### 网站连接数据库方式

网站前端位于 Cloudflare Pages，只保存 Supabase 项目编号和公开匿名密钥。公开匿名密钥只用于初始化 Supabase 登录客户端和读取公开接口，不具备数据库管理员权限。

登录、注册、考核、入册、后台管理等业务数据统一访问 Supabase Edge Function：

```text
https://bauvdyyrtobyxhamjiwk.supabase.co/functions/v1/make-server-0e17939c
```

前端请求统一封装在 `src/app/lib/supabase.ts` 中：

- `publicApi`：读取首页、公告、活动、公开名册等不需要登录的数据，自动使用公开匿名密钥。
- `authApi`：读取或写入当前用户资料、考核结果、入册申请、执事后台数据，调用前会自动从 Supabase 登录客户端获取最新会话令牌。
- `apiRequest`：统一处理请求地址、请求头、返回 JSON 和错误提示，避免每个页面重复手写接口连接逻辑。

后端函数位于 `supabase/functions/server/index.tsx`，部署到 Supabase 后通过服务端环境变量 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 连接数据库。`SUPABASE_SERVICE_ROLE_KEY` 只能放在 Supabase 后端函数环境变量中，严禁写入前端源码或 README。

### 整理 Supabase 数据库结构

本项目已根据当前网站功能整理了线上数据，用户填写过的入册资料、名册资料、考核记录、通知记录和旧云灯内容均已保留。服务端密钥只能安全读写表数据，不能直接执行删除字段或删除表的结构命令。

如需进一步删除不再使用的空表、空字段和旧触发器，请先确认本机 `database-backups` 目录已经存在完整备份，然后进入 Supabase 控制台的 SQL 编辑器，复制执行：

```text
supabase/database-cleanup.sql
```

该脚本只删除当前网站不再使用且没有用户填写内容的结构，包括空表 `event_registrations`、`kv_store_0e17939c`，以及 `join_applications` 中已经全空的旧请求字段。

如果入册申请提交时报 `record "new" has no field "requested_nickname"`，说明数据库里仍有旧触发器引用已经删除的旧字段，请重新执行 `supabase/database-cleanup.sql` 中的旧触发器清理部分。

如果问心考核提交时报 `there is no unique or exclusion constraint matching the ON CONFLICT specification`，说明线上 `wenxin_quiz_results` 表没有 `user_id` 唯一约束。当前仓库中的后端函数已改为“先查最近记录，再按 id 更新或插入”的兼容写法，重新部署 Supabase 后端函数后即可恢复保存。

## 使用教程

### 浏览首页

打开本地地址或 Cloudflare Pages 线上地址后，会进入问云派首页，可查看门派介绍、公告摘要和成员摘要。

### 查看立派金典

点击顶部导航中的“立派金典”，可阅读问云派章程、群规、同门盟约等内容。章节支持展开与收起。

### 查看公告

点击“问云公告”，可查看社群公告。公告数据来自 Supabase 后端接口，接口不可用时页面可能显示为空。

### 查看活动

点击“问云雅集”，可查看门派活动内容。活动数据来自 Supabase 后端接口。

### 参加问心考核

点击“问心考核”后，未登录用户会先看到登录引导，不会提前显示题目。登录后按一题一题的方式作答，答题达到 80 分及以上即视为通过。提交后页面只显示本次分数，并引导继续阅读《立派金典》，不展示正确答案或错误答案。

### 申请登记入册

“问云名册”公开可浏览，未登录用户也能查看已入册成员。填写入册资料的入口会按当前状态引导：未登录时先登录，已登录但未考核时点击可直接跳转到“问心考核”，通过考核后才会展开登记入册表单。道名必须以“云”字开头，例如“云清”。

### 进入用户中心

登录后点击“问云小院”，可查看个人资料、考核状态、入册申请状态和快捷入口。

### 使用执事后台

执事账号可进入“执事后台”，查看完整入册资料，审核入册申请，管理公告、活动和成员信息。入册申请页只展示待审核、未通过或其他未正式入册状态的申请，不再混入已经通过的正式成员；该页支持按道名、江湖名、城市、联系方式、状态等内容搜索。点击入册申请的“查看”后，可在详情弹窗顶部直接选择“审核通过”或“未通过”，也可以先修改资料再保存。

全体成员页只展示已经通过入册的正式成员，并支持按编号、道名、江湖名、城市、联系方式、角色等内容搜索。宗主账号显示为“宗主”，除执事后台能力外，还可以在全体成员中任命或撤销成员的执事身份。有权限的账号会在“问云小院”快捷入口中看到“执事后台”，后台页面也提供返回“问云小院”的入口。全体成员在手机端会显示为卡片列表，避免表格挤压变形。

## 项目目录结构

```text
wypgfwz
├─ .gitignore                 Git 上传忽略规则，避免提交依赖、构建产物和本地密钥
├─ .nvmrc                     Node.js 版本声明，方便部署平台识别运行版本
├─ .node-version              Node.js 版本声明，兼容更多版本管理工具
├─ index.html                 网站入口页面
├─ package.json               项目脚本、依赖和版本配置
├─ package-lock.json          npm 依赖锁定文件，保证安装结果稳定
├─ vite.config.ts             Vite 构建与开发服务配置
├─ postcss.config.mjs         样式处理配置
├─ default_shadcn_theme.css   默认组件主题样式参考
├─ ATTRIBUTIONS.md            资源来源说明
├─ README.md                  项目中文说明文档
├─ public                     Cloudflare Pages 会直接复制的静态部署配置目录
│  └─ _headers                Cloudflare Pages 响应头和缓存规则
├─ src                        前端源码目录
│  ├─ main.tsx                前端应用入口
│  ├─ styles                  全局样式目录
│  ├─ imports                 需求与文本素材目录
│  └─ app                     网站主体代码
│     ├─ App.tsx              页面路由入口
│     ├─ components           通用组件和界面组件
│     ├─ context              登录状态与全局上下文
│     ├─ lib                  接口、题库等公共逻辑
│     └─ pages                各个页面代码
├─ supabase                   Supabase 后端函数与相关代码
│  ├─ database-cleanup.sql     数据库结构清理脚本，需在 Supabase SQL 编辑器中手动执行
│  └─ functions
│     ├─ server               后台业务代码统一维护目录
│     └─ make-server-0e17939c 线上函数入口目录，保持前端接口地址可直接访问
├─ utils                      Supabase 项目信息配置
├─ guidelines                 项目辅助说明目录
├─ plans                      开发计划与需求记录目录
└─ dist                       执行打包后生成的生产文件目录，已被 Git 忽略
```

## 常见问题排查

### Cloudflare Pages 构建失败并提示找不到构建命令

请进入 Cloudflare Pages 项目的“设置 - 构建与部署”，检查构建命令是否填写为：

```text
npm run build
```

如果部署日志出现 `No build command specified. Skipping build step.`，说明 Cloudflare 控制台没有填写构建命令。请在 Cloudflare Pages 控制台补充构建命令，不要通过 `wrangler.toml` 配置。

### Cloudflare Pages 提示 wrangler.toml 不支持 build

如果部署日志出现 `Configuration file for Pages projects does not support "build"`，说明仓库里存在带 `[build]` 配置的 `wrangler.toml`。本项目不需要提交 `wrangler.toml`，请删除该文件，然后在 Cloudflare 控制台里填写构建命令 `npm run build`、构建输出目录 `dist`。

### Cloudflare Pages 部署后页面空白

请先在本地执行：

```powershell
npm run build
```

如果本地构建失败，按照终端报错中显示的文件和行号修复代码。构建成功后，再重新推送到 GitHub 触发云端部署。

### Cloudflare Pages 部署后刷新子页面没有显示内容

本项目没有生成顶层 `404.html`，Cloudflare Pages 会按单页应用方式把子路径交给前端路由处理。请不要额外添加会拦截所有静态资源的通配重定向规则。

### 执行 npm install 很慢或超时

可能是网络下载依赖较慢。可以重新执行：

```powershell
npm install
```

如果仍然失败，先确认网络可访问 npm 官方源，再重新安装。

### 端口 5173 被占用

Vite 会自动尝试其他端口。请以终端中显示的本地地址为准，例如：

```text
http://127.0.0.1:5174/
```

### 页面能打开但公告或成员数据为空

公告、成员、活动、登录等数据依赖 Supabase 后端接口。请检查 `utils/supabase/info.tsx` 中的项目编号和公开密钥是否正确，并确认后端函数已经部署。

### 审核或保存资料时提示某个字段不存在

项目后端已经加入旧表结构兼容逻辑。保存入册申请或成员资料时，如果线上数据库缺少 `birth_month` 等新版字段，后端会自动跳过不存在的字段并重试，优先保证审核、保存和名册状态修改可用。

### 部署后端函数提示访问令牌格式错误

如果执行 Supabase CLI 部署时提示访问令牌格式错误，请确认使用的是 Supabase 平台访问令牌，通常以 `sbp_` 开头。以 `sb_secret_` 开头的密钥不能用于 CLI 部署后端函数。

### 提交入册申请提示道名不正确

道名必须以“云”字开头，例如“云清”“云晚禾”。如果填写为“清云”，前端和后端都会拒绝提交。

### 构建时提示包体较大

当前构建可能出现单个文件超过 500 kB 的提醒，这是性能优化建议，不会阻止网站运行。后续可通过路由懒加载和拆分依赖包继续优化。

## 更新日志

2026-06-14 20:12 【修复】修复入册申请审核通过时报 join_applications_member_role_check 约束错误的问题，申请表不再写入名册角色；优化查看申请资料弹窗，顶部固定显示审核通过和未通过操作；优化全体成员移动端为卡片布局，避免表格内容挤压。
2026-06-14 20:19 【修复】修复线上旧数据库缺少 birth_month 等字段时无法保存或审核的问题，后端新增字段兼容写入逻辑，遇到不存在的字段会自动跳过并重试；成员名册查询改为读取全字段以兼容不同表结构。
2026-06-14 19:43 【优化】补充 Supabase 后端函数部署失败排查说明，明确 CLI 部署必须使用 sbp_ 开头的平台访问令牌。
2026-06-14 19:48 【修复】将 Supabase 线上函数入口文件改为 CLI 要求的 index.ts，解决云端部署时找不到入口文件的问题。
2026-06-14 19:38 【修复】新增与线上接口地址一致的 Supabase 函数入口，修正 README 中的后端函数部署命令，避免部署成功后前端仍访问不到后台接口。
2026-06-14 19:24 【优化】补充 Supabase 后端函数部署说明，明确本项目使用本地 Supabase CLI 部署，部署时需要 Supabase 平台访问令牌。
2026-06-14 19:24 【优化】统一后台“查看”和“编辑”为一个可编辑详情入口；成员详情新增名册状态修改，可将正式成员改为审核通过或未通过；全体成员接口只返回已通过的正式成员，并在问云小院补充执事后台快捷入口。
2026-06-14 19:07 【新增】完善执事后台管理能力，入册申请支持完整资料查看、编辑和审核，全体成员支持完整资料查看、编辑；新增宗主身份显示与宗主任命、撤销执事的前后端接口，同步更新 README 使用说明。
2026-06-14 18:35 【修复】修复注册、考核题库、入册表单中的中文引号语法错误，解决网站启动后页面无法编译显示的问题；同步完善中文 README 文档，并固定 Supabase 依赖版本号。
2026-06-20 13:56 【优化】适配 Cloudflare Pages 自动部署，新增 Node.js 版本文件、Git 忽略规则和 Cloudflare 响应头配置；调整 React 依赖为正式依赖，更新 README 中 GitHub 绑定 Cloudflare 的部署教程。
2026-06-20 14:25 【修复】修复 Cloudflare Pages 读取 wrangler.toml 后跳过构建和不支持 build 字段的问题，移除 wrangler.toml 并明确构建命令必须在 Cloudflare 控制台填写；完成线上数据库数据补齐，新增数据库结构清理脚本并保护本地备份不上传 GitHub。
2026-06-20 14:45 【优化】优化执事后台入册申请和全体成员页面，入册申请只展示非已通过记录，全体成员只展示已通过成员，并为两个页面新增成员资料搜索功能；同步修复弹窗可访问性提示并更新 README 使用说明。
2026-06-20 15:03 【修复】修复问心考核结果保存失败但前端仍显示通过的问题，后端补齐考核结果写入字段，前端新增保存失败提示；修复用户切换时问云小院短暂显示上一位用户状态的问题；数据库清理脚本补充旧触发器清理说明。
2026-06-20 15:13 【优化】优化问心考核和名册登记流程，未登录时考核页只显示登录引导，登录后改为单题逐步作答，结果页只显示分数并引导阅读立派金典；问云名册继续公开浏览，仅登记入口按登录和考核状态引导。
2026-06-20 15:25 【优化】统一网站连接 Supabase 数据库的前端请求层，新增公开接口和登录接口封装，登录请求自动获取最新会话令牌；同步更新 README 中数据库连接方式说明，降低考核、名册、后台保存时因旧令牌导致失败的概率。
2026-06-20 15:35 【修复】定位并修复问心考核后端保存依赖 `user_id` 唯一约束的问题，改为兼容旧库的“先查询再更新/插入”写法；同步在 README 增补 Supabase 考核保存报错排查说明。
