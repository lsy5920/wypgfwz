const SUPER_ADMIN_NICKNAMES = new Set(["云泽"]);

export const isSectLeaderProfile = (profile?: { nickname?: string | null } | null) => {
  if (!profile) return false;
  return SUPER_ADMIN_NICKNAMES.has(profile.nickname ?? "");
};

export const isAdminProfile = (profile?: { role?: string | null; nickname?: string | null } | null) => {
  if (!profile) return false;
  return profile.role === "admin" || isSectLeaderProfile(profile);
};

export const adminBadgeLabel = (profile?: { role?: string | null; nickname?: string | null } | null) => {
  if (!profile) return "";
  if (isSectLeaderProfile(profile)) return "宗主";
  if (profile.role === "admin") return "执事";
  return "";
};
