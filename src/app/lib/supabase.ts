import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
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
