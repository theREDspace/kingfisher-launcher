import { beforeEach, describe, expect, it } from "vitest";
import { loadOrgStorage, saveOrgStorage, type Org, type OrgStorageState } from "@/store/org-storage";

const STORAGE_KEY = "comcast-launcher:orgs";

beforeEach(() => {
  localStorage.clear();
});

describe("org-storage", () => {
  it("round-trips a saved state", () => {
    const org: Org = { id: "org_1", name: "Acme Corp", orgId: "acme", apiKey: "secret-key" };
    const state: OrgStorageState = { orgs: [org], selectedOrgId: "org_1" };
    saveOrgStorage(state);
    expect(loadOrgStorage()).toEqual(state);
  });

  it("falls back to empty state on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not json{{{");
    expect(loadOrgStorage()).toEqual({ orgs: [], selectedOrgId: null });
  });
});
