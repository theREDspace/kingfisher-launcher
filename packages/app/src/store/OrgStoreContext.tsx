import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createOrgId,
  loadOrgStorage,
  saveOrgStorage,
  type Org,
  type OrgStorageState,
} from "@/store/org-storage";

export interface OrgInput {
  name: string;
  orgId: string;
  apiKey: string;
  baseUrl?: string;
}

interface OrgStoreValue {
  orgs: Org[];
  selectedOrg: Org | null;
  selectOrg: (id: string) => void;
  addOrg: (input: OrgInput) => Org;
  updateOrg: (id: string, input: OrgInput) => void;
  deleteOrg: (id: string) => void;
}

const OrgStoreContext = createContext<OrgStoreValue | null>(null);

export function OrgStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrgStorageState>(() => loadOrgStorage());

  useEffect(() => {
    saveOrgStorage(state);
  }, [state]);

  const value = useMemo<OrgStoreValue>(() => {
    const selectedOrg = state.orgs.find((o) => o.id === state.selectedOrgId) ?? null;

    return {
      orgs: state.orgs,
      selectedOrg,
      selectOrg: (id) => setState((s) => ({ ...s, selectedOrgId: id })),
      addOrg: (input) => {
        const org: Org = { id: createOrgId(), ...input };
        setState((s) => ({ orgs: [...s.orgs, org], selectedOrgId: org.id }));
        return org;
      },
      updateOrg: (id, input) => {
        setState((s) => ({
          ...s,
          orgs: s.orgs.map((o) => (o.id === id ? { ...o, ...input } : o)),
        }));
      },
      deleteOrg: (id) => {
        setState((s) => {
          const orgs = s.orgs.filter((o) => o.id !== id);
          const selectedOrgId = s.selectedOrgId === id ? (orgs[0]?.id ?? null) : s.selectedOrgId;
          return { orgs, selectedOrgId };
        });
      },
    };
  }, [state]);

  return <OrgStoreContext.Provider value={value}>{children}</OrgStoreContext.Provider>;
}

export function useOrgStore(): OrgStoreValue {
  const ctx = useContext(OrgStoreContext);
  if (!ctx) throw new Error("useOrgStore must be used within an OrgStoreProvider");
  return ctx;
}
