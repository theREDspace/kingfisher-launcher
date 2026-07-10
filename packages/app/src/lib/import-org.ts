import type { OrgInput } from "@/store/OrgStoreContext";
import type { Org } from "@/store/org-storage";
import type { Preset } from "@/store/preset-storage";

export interface PresetImport {
  name: string;
  url: string;
  appId: string;
}

export interface OrgImportResult {
  org: OrgInput;
  presets: PresetImport[];
}

/**
 * Given an import result, existing orgs, and existing presets, return the
 * org and presets that are actually new — deduplicating by Kingfisher `orgId`
 * and by preset `url` + `appId` combination.
 *
 * - If an org with the same Kingfisher `orgId` already exists, `orgToAdd` is
 *   `null` and `matchedOrgId` is the existing org's internal ID.
 * - Presets matching an existing entry (same `orgId` + `url` + `appId`) are
 *   filtered out.
 */
export function deduplicateImport(
  result: OrgImportResult,
  existingOrgs: Org[],
  existingPresets: Preset[],
): { orgToAdd: OrgInput | null; presetsToAdd: PresetImport[]; matchedOrgId: string | null } {
  const existingOrg = existingOrgs.find((o) => o.orgId === result.org.orgId);

  if (existingOrg) {
    const presetsToAdd = result.presets.filter(
      (p) =>
        !existingPresets.some(
          (ep) => ep.orgId === existingOrg.id && ep.url === p.url && ep.appId === p.appId,
        ),
    );
    return { orgToAdd: null, presetsToAdd, matchedOrgId: existingOrg.id };
  }

  return { orgToAdd: result.org, presetsToAdd: result.presets, matchedOrgId: null };
}

function stringField(data: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string") return value;
  }
  return "";
}

function parsePresets(raw: unknown): PresetImport[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is PresetImport => {
    if (typeof item !== "object" || item === null) return false;
    const p = item as Record<string, unknown>;
    return typeof p.name === "string" && typeof p.url === "string" && typeof p.appId === "string";
  });
}

/** Resolves `null` if the user cancels the file picker or the file isn't valid JSON. */
export function pickOrgJsonFile(): Promise<OrgImportResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(String(reader.result)) as Record<string, unknown>;
        } catch {
          resolve(null);
          return;
        }

        resolve({
          org: {
            name: stringField(data, "name") || file.name.replace(/\.json$/i, ""),
            orgId: stringField(data, "orgId", "org_id"),
            apiKey: stringField(data, "apiKey", "api_key"),
            baseUrl: stringField(data, "baseUrl", "base_url") || undefined,
          },
          presets: parsePresets(data.presets),
        });
      };
      reader.readAsText(file);
    };

    input.click();
  });
}

export function exportOrgJson(org: Org, presets: Preset[]): void {
  const data: Record<string, unknown> = {
    name: org.name,
    orgId: org.orgId,
    apiKey: org.apiKey,
  };
  if (org.baseUrl) data.baseUrl = org.baseUrl;
  data.presets = presets.map((p) => ({
    name: p.name,
    url: p.url,
    appId: p.appId,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${org.name.replace(/\s+/g, "-").toLowerCase()}-kingfisher-launcher.json`;
  a.click();
  URL.revokeObjectURL(url);
}
