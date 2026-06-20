-- 问云派数据库结构清理脚本
-- 使用方式：先确认本地 database-backups 目录已有完整备份，再复制到 Supabase SQL 编辑器执行。
-- 原则：只删除当前网站不再使用且没有用户填写内容的数据结构；含用户内容的旧表暂时保留。

begin;

-- 空表清理：当前线上没有任何记录，且当前网站源码不再读取。
drop table if exists public.event_registrations cascade;
drop table if exists public.kv_store_0e17939c cascade;

-- 入册申请旧请求字段已经全为空，当前网站使用 dao_name、contact、birth_month 等正式字段。
alter table if exists public.join_applications
  drop column if exists requested_nickname,
  drop column if exists requested_legacy_contact,
  drop column if exists requested_at;

commit;
