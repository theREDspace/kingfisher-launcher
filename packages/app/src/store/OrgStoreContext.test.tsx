import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { OrgStoreProvider, useOrgStore, type OrgInput } from "@/store/OrgStoreContext";

const orgInputA: OrgInput = { name: "Acme Corp", orgId: "acme", apiKey: "key-a" };
const orgInputB: OrgInput = { name: "Beta Inc", orgId: "beta", apiKey: "key-b" };

beforeEach(() => {
  localStorage.clear();
});

describe("OrgStoreProvider / useOrgStore", () => {
  it("addOrg adds and selects the org", () => {
    const { result } = renderHook(() => useOrgStore(), { wrapper: OrgStoreProvider });

    let created: ReturnType<typeof result.current.addOrg> | undefined;
    act(() => {
      created = result.current.addOrg(orgInputA);
    });

    expect(result.current.orgs).toHaveLength(1);
    expect(result.current.selectedOrg?.id).toBe(created?.id);
  });

  it("deleteOrg falls back to the next remaining org if it was selected", () => {
    const { result } = renderHook(() => useOrgStore(), { wrapper: OrgStoreProvider });

    let orgA: ReturnType<typeof result.current.addOrg>;
    let orgB: ReturnType<typeof result.current.addOrg>;
    act(() => {
      orgA = result.current.addOrg(orgInputA);
    });
    act(() => {
      orgB = result.current.addOrg(orgInputB);
    });
    expect(result.current.selectedOrg?.id).toBe(orgB!.id);

    act(() => {
      result.current.deleteOrg(orgB!.id);
    });

    expect(result.current.orgs).toHaveLength(1);
    expect(result.current.selectedOrg?.id).toBe(orgA!.id);
  });
});
