-- 问云派数据库结构清理脚本
-- 使用方式：先确认本地 database-backups 目录已有完整备份，再复制到 Supabase SQL 编辑器执行。
-- 原则：只删除当前网站不再使用且没有用户填写内容的数据结构；含用户内容的旧表暂时保留。
-- 注意：如果旧触发器仍引用 requested_nickname、requested_legacy_contact 或 requested_at，
-- 删除字段后新增入册申请会报 record "new" has no field "requested_nickname"。
-- 因此本脚本会先清理这些旧触发器，再删除旧字段。

begin;

-- 空表清理：当前线上没有任何记录，且当前网站源码不再读取。
drop table if exists public.event_registrations cascade;
drop table if exists public.kv_store_0e17939c cascade;

-- 旧触发器清理：这些触发器来自早期登记流程，会读取已经不再使用的 requested_* 字段。
drop trigger if exists join_applications_set_requested_nickname on public.join_applications;
drop trigger if exists join_applications_set_requested_fields on public.join_applications;
drop trigger if exists set_requested_nickname on public.join_applications;
drop trigger if exists set_requested_fields on public.join_applications;
drop trigger if exists trg_join_applications_requested_fields on public.join_applications;
drop trigger if exists trg_join_applications_requested_nickname on public.join_applications;

-- 旧函数清理：函数不存在时不会报错，存在时会随触发器一并删除。
drop function if exists public.set_requested_nickname() cascade;
drop function if exists public.set_requested_fields() cascade;
drop function if exists public.join_applications_set_requested_nickname() cascade;
drop function if exists public.join_applications_set_requested_fields() cascade;

-- 入册申请旧请求字段已经全为空，当前网站使用 dao_name、contact、birth_month 等正式字段。
alter table if exists public.join_applications
  drop column if exists requested_nickname,
  drop column if exists requested_legacy_contact,
  drop column if exists requested_at;

commit;
