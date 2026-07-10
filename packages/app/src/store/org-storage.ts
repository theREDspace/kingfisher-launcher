export interface Org {
  id: string;
  name: string;
  orgId: string;
  apiKey: string;
  baseUrl?: string;
}

export interface OrgStorageState {
  orgs: Org[];
  selectedOrgId: string | null;
}

const STORAGE_KEY = "comcast-launcher:orgs";

const EMPTY_STATE: OrgStorageState = { orgs: [], selectedOrgId: null };

function isOrg(value: unknown): value is Org {
  if (typeof value !== "object" || value === null) return false;
  const org = value as Record<string, unknown>;
  return (
    typeof org.id === "string" &&
    typeof org.name === "string" &&
    typeof org.orgId === "string" &&
    typeof org.apiKey === "string"
  );
}

export function loadOrgStorage(): OrgStorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;

    const parsed = JSON.parse(raw) as Partial<OrgStorageState>;
    const orgs = Array.isArray(parsed.orgs) ? parsed.orgs.filter(isOrg) : [];
    const selectedOrgId =
      typeof parsed.selectedOrgId === "string" ? parsed.selectedOrgId : null;
    return { orgs, selectedOrgId };
  } catch {
    // Corrupt JSON, or localStorage unavailable (private browsing, storage disabled) — start fresh.
    return EMPTY_STATE;
  }
}

export function saveOrgStorage(state: OrgStorageState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — orgs stay in memory for this session but won't persist.
  }
}

export function createOrgId(): string {
  return `org_${Math.random().toString(36).slice(2, 10)}`;
}

export function orgInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials || "?";
}
