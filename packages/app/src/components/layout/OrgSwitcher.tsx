import { Check, ChevronDown, Plus, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orgInitials } from "@/store/org-storage";
import { useOrgStore } from "@/store/OrgStoreContext";
import { usePresetStore } from "@/store/PresetStoreContext";
import { deduplicateImport, pickOrgJsonFile } from "@/lib/import-org";
import type { OrgManagerRequest } from "@/components/orgs/OrgManagementModal";

interface OrgSwitcherProps {
  onOpenOrgManager: (request: OrgManagerRequest) => void;
}

export function OrgSwitcher({ onOpenOrgManager }: OrgSwitcherProps) {
  const { orgs, selectedOrg, selectOrg, addOrg } = useOrgStore();
  const { presets, addPreset } = usePresetStore();

  async function handleImport() {
    const result = await pickOrgJsonFile();
    if (!result) return;
    const { orgToAdd, presetsToAdd, matchedOrgId } = deduplicateImport(result, orgs, presets);
    const targetOrgId = matchedOrgId ?? addOrg(orgToAdd!).id;
    for (const preset of presetsToAdd) {
      addPreset({ orgId: targetOrgId, ...preset });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 items-center gap-2.5 rounded-[10px] border border-border bg-white py-0 pr-3 pl-3.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="max-w-45 truncate text-sm font-semibold text-navy">
          {selectedOrg ? selectedOrg.name : "No organization"}
        </span>
        <ChevronDown className="text-muted-foreground-strong" size={16} strokeWidth={2.2} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-70 rounded-[14px] p-1.5 shadow-dropdown">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
            Organizations
          </DropdownMenuLabel>

          {orgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => selectOrg(org.id)}
              className="gap-2.5 rounded-[9px] px-2.5 py-2.25"
            >
              <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7px] bg-surface-subtle text-xs font-bold text-navy">
                {orgInitials(org.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-navy">
                  {org.name}
                </span>
              </span>
              {selectedOrg?.id === org.id && (
                <Check className="text-primary" size={16} strokeWidth={2.6} />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={() =>
            onOpenOrgManager({ view: "form", draft: { name: "", orgId: "", apiKey: "", baseUrl: "" } })
          }
          className="gap-2 rounded-[9px] px-2.5 py-2.25 text-[13.5px] font-semibold text-primary"
        >
          <Plus size={16} strokeWidth={2.2} />
          Add organization
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleImport}
          className="gap-2 rounded-[9px] px-2.5 py-2.25 text-[13.5px] font-semibold text-navy"
        >
          <Upload size={16} strokeWidth={2.2} />
          Import organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
