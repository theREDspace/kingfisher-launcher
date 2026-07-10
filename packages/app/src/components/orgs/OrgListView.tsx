import { useState } from "react";
import { Download, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import type { Org } from "@/store/org-storage";
import { orgInitials } from "@/store/org-storage";

interface OrgListViewProps {
  orgs: Org[];
  onEdit: (org: Org) => void;
  onDelete: (org: Org) => void;
  onExport: (org: Org) => void;
  onAddNew: () => void;
  onImport: () => void;
}

export function OrgListView({ orgs, onEdit, onDelete, onExport, onAddNew, onImport }: OrgListViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      {orgs.map((org) =>
        deletingId === org.id ? (
          <div
            key={org.id}
            className="flex items-center gap-2 rounded-[13px] bg-destructive-bg px-3.5 py-3.5"
          >
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-navy">
              Delete &ldquo;{org.name}&rdquo;?
            </span>
            <button
              type="button"
              onClick={() => {
                onDelete(org);
                setDeletingId(null);
              }}
              className="h-8.5 rounded-lg bg-primary px-3.5 text-[12.5px] font-bold text-white hover:bg-primary-hover"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              title="Cancel"
              aria-label="Cancel delete"
              className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground-strong"
            >
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <div
            key={org.id}
            className="flex items-center gap-3 rounded-[13px] border border-border-soft bg-surface-table-head p-3.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-subtle text-[13px] font-bold text-navy">
              {orgInitials(org.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-bold text-navy">{org.name}</div>
              <div className="text-xs text-muted-foreground tabular-nums">{org.orgId}</div>
            </div>
            <button
              type="button"
              title="Export"
              aria-label={`Export ${org.name}`}
              onClick={() => onExport(org)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-[9px] border border-border bg-white text-muted-foreground-strong"
            >
              <Download size={15} strokeWidth={2} />
            </button>
            <button
              type="button"
              title="Edit"
              aria-label={`Edit ${org.name}`}
              onClick={() => onEdit(org)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-[9px] border border-border bg-white text-navy"
            >
              <Pencil size={15} strokeWidth={2} />
            </button>
            <button
              type="button"
              title="Delete"
              aria-label={`Delete ${org.name}`}
              onClick={() => setDeletingId(org.id)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-[9px] border border-border bg-white text-primary"
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
          </div>
        ),
      )}

      <div className="mt-1 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={onAddNew}
          className="flex h-12 min-w-45 flex-1 items-center justify-center gap-2 rounded-[13px] border-[1.5px] border-dashed border-border-strong text-sm font-bold text-primary"
        >
          <Plus size={17} strokeWidth={2.2} />
          Add organization
        </button>
        <button
          type="button"
          onClick={onImport}
          className="flex h-12 min-w-45 flex-1 items-center justify-center gap-2 rounded-[13px] border-[1.5px] border-dashed border-border-strong text-sm font-bold text-navy"
        >
          <Upload size={17} strokeWidth={2.2} />
          Import organization
        </button>
      </div>
    </div>
  );
}
