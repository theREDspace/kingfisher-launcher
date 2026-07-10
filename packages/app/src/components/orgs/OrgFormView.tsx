import { useId } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApiKeyField } from "@/components/orgs/ApiKeyField";
import type { OrgInput } from "@/store/OrgStoreContext";

interface OrgFormViewProps {
  draft: OrgInput;
  onChange: (draft: OrgInput) => void;
  isEditing: boolean;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function OrgFormView({
  draft,
  onChange,
  isEditing,
  confirmingDelete,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onCancel,
  onSave,
}: OrgFormViewProps) {
  const nameId = useId();
  const orgIdId = useId();
  const baseUrlId = useId();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor={nameId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            Org Name
          </label>
          <Input
            id={nameId}
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            placeholder="Acme Media Group"
            className="h-11 rounded-control border-border px-3.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor={orgIdId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            Org ID
          </label>
          <Input
            id={orgIdId}
            value={draft.orgId}
            onChange={(e) => onChange({ ...draft, orgId: e.target.value })}
            placeholder="ACME-001"
            className="h-11 rounded-control border-border px-3.5 text-sm tabular-nums"
          />
        </div>
        <div>
          <label htmlFor={baseUrlId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            Server URL
          </label>
          <Input
            id={baseUrlId}
            value={draft.baseUrl ?? ""}
            onChange={(e) => onChange({ ...draft, baseUrl: e.target.value || undefined })}
            placeholder="https://kingfisher.example.com"
            className="h-11 rounded-control border-border px-3.5 text-sm"
          />
        </div>
        <ApiKeyField
          value={draft.apiKey}
          onChange={(apiKey) => onChange({ ...draft, apiKey })}
        />

        {confirmingDelete && (
          <div className="rounded-[13px] border border-destructive-border bg-destructive-bg p-3.5">
            <div className="text-[13.5px] font-bold text-navy">Delete this organization?</div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground-strong">
              This can't be undone.
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onConfirmDelete}
                className="h-9.5 rounded-[10px] bg-primary px-4 text-[13.5px] font-bold text-white hover:bg-primary-hover"
              >
                Delete organization
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="h-9.5 rounded-[10px] border border-border bg-white px-4 text-[13.5px] font-semibold text-navy"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border-soft pt-4">
        {isEditing ? (
          <button
            type="button"
            onClick={onRequestDelete}
            className="flex h-10.5 items-center gap-1.75 rounded-[10px] px-3.5 text-[13.5px] font-bold text-primary"
          >
            <Trash2 size={15} strokeWidth={2} />
            Delete
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2.25">
          <button
            type="button"
            onClick={onCancel}
            className="h-10.5 rounded-control border border-border bg-white px-4.5 text-sm font-semibold text-navy"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-10.5 rounded-control bg-primary px-5 text-sm font-bold text-white shadow-[0_10px_22px_-10px_rgb(235_22_30_/_60%)] hover:bg-primary-hover"
          >
            {isEditing ? "Save changes" : "Create organization"}
          </button>
        </div>
      </div>
    </>
  );
}
