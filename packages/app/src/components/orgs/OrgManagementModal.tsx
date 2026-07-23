import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { OrgListView } from "@/components/orgs/OrgListView";
import { OrgFormView } from "@/components/orgs/OrgFormView";
import { deduplicateImport, exportOrgJson, pickOrgJsonFile } from "@/lib/import-org";
import { useOrgStore, type OrgInput } from "@/store/OrgStoreContext";
import { usePresetStore } from "@/store/PresetStoreContext";
import type { Org } from "@/store/org-storage";

type OrgDraft = OrgInput & { id?: string };

const EMPTY_DRAFT: OrgDraft = { name: "", orgId: "", apiKey: "", baseUrl: "" };

export type OrgManagerRequest = { view: "list" } | { view: "form"; draft: OrgDraft };

interface OrgManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: OrgManagerRequest;
}

export function OrgManagementModal({ open, onOpenChange, request }: OrgManagementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[560px] gap-0 rounded-[20px] p-0 shadow-modal ring-0 sm:max-w-[560px]"
      >
        {open && <OrgManagementModalBody request={request} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

// Rendered fresh each time the dialog opens, so its view/draft state always
// starts from `request` instead of leaking the previous session's state.
function OrgManagementModalBody({
  request,
  onOpenChange,
}: {
  request: OrgManagerRequest;
  onOpenChange: (open: boolean) => void;
}) {
  const { orgs, addOrg, updateOrg, deleteOrg } = useOrgStore();
  const { presets, addPreset } = usePresetStore();
  const [view, setView] = useState<"list" | "form">(request.view);
  const [draft, setDraft] = useState<OrgDraft>(request.view === "form" ? request.draft : EMPTY_DRAFT);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEditing = Boolean(draft.id);

  function startAddNew() {
    setDraft(EMPTY_DRAFT);
    setConfirmingDelete(false);
    setView("form");
  }

  function startEdit(org: Org) {
    setDraft(org);
    setConfirmingDelete(false);
    setView("form");
  }

  async function startImport() {
    const result = await pickOrgJsonFile();
    if (!result) return;
    const { orgToAdd, presetsToAdd, matchedOrgId } = deduplicateImport(result, orgs, presets);
    if (matchedOrgId) {
      updateOrg(matchedOrgId, result.org);
    }
    const targetOrgId = matchedOrgId ?? addOrg(orgToAdd!).id;
    for (const preset of presetsToAdd) {
      addPreset({ orgId: targetOrgId, ...preset });
    }
    backToList();
  }

  function backToList() {
    setConfirmingDelete(false);
    setView("list");
  }

  function handleSave() {
    const name = draft.name.trim() || "Untitled Org";
    const input: OrgInput = { name, orgId: draft.orgId, apiKey: draft.apiKey, baseUrl: draft.baseUrl };
    if (draft.id) {
      updateOrg(draft.id, input);
    } else {
      addOrg(input);
    }
    backToList();
  }

  function handleConfirmDelete() {
    if (!draft.id) return;
    deleteOrg(draft.id);
    backToList();
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-soft px-6.5 pt-5.5 pb-4.5">
        <div className="flex items-center gap-3">
          {view === "form" && (
            <button
              type="button"
              onClick={backToList}
              title="Back to organizations"
              aria-label="Back to organizations"
              className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-surface-muted text-navy"
            >
              <ChevronLeft size={17} strokeWidth={2.2} />
            </button>
          )}
          <div>
            <DialogTitle className="text-[18px] font-extrabold tracking-tight text-navy">
              {view === "list" ? "Organizations" : isEditing ? "Edit organization" : "New organization"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
              {view === "list"
                ? "Manage your organizations and API keys"
                : isEditing
                  ? "Update details and credentials"
                  : "Add a new organization"}
            </DialogDescription>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          title="Close"
          aria-label="Close organizations"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-surface-muted text-muted-foreground-strong"
        >
          <X size={17} strokeWidth={2.2} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6.5 pt-5 pb-6">
        {view === "list" ? (
          <OrgListView
            orgs={orgs}
            onEdit={startEdit}
            onDelete={(org) => deleteOrg(org.id)}
            onExport={(org) => {
              const orgPresets = presets.filter((p) => p.orgId === org.id);
              exportOrgJson(org, orgPresets);
            }}
            onAddNew={startAddNew}
            onImport={startImport}
          />
        ) : (
          <OrgFormView
            draft={draft}
            onChange={setDraft}
            isEditing={isEditing}
            confirmingDelete={confirmingDelete}
            onRequestDelete={() => setConfirmingDelete(true)}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={() => setConfirmingDelete(false)}
            onCancel={backToList}
            onSave={handleSave}
          />
        )}
      </div>
    </>
  );
}
