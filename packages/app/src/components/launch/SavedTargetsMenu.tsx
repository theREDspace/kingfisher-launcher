import { useState } from "react";
import { Menu, Pencil, Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Preset } from "@/store/preset-storage";

interface SavedTargetsMenuProps {
  presets: Preset[];
  orgName: string;
  onApply: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onSaveCurrent: () => void;
}

export function SavedTargetsMenu({
  presets,
  orgName,
  onApply,
  onEdit,
  onDelete,
  onSaveCurrent,
}: SavedTargetsMenuProps) {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function closeAnd(fn: () => void) {
    setOpen(false);
    setDeletingId(null);
    fn();
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDeletingId(null);
      }}
    >
      <PopoverTrigger
        title="Saved targets"
        className="flex h-8.5 items-center gap-1.75 rounded-[9px] border border-border bg-white px-2.75 text-xs font-semibold text-navy"
      >
        <Menu size={16} strokeWidth={2.2} />
        Saved targets
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 gap-0 rounded-[14px] p-1.5 shadow-dropdown">
        <div className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
          Saved for {orgName}
        </div>

        {presets.length === 0 && (
          <div className="px-2.5 pt-1 pb-3 text-[12.5px] text-muted-foreground">
            No saved targets yet.
          </div>
        )}

        {presets.map((preset) =>
          deletingId === preset.id ? (
            <div
              key={preset.id}
              className="flex items-center gap-2 rounded-[9px] bg-destructive-bg px-2.5 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-navy">
                Delete &ldquo;{preset.name}&rdquo;?
              </span>
              <button
                type="button"
                onClick={() => closeAnd(() => onDelete(preset.id))}
                className="h-7.5 rounded-lg bg-primary px-3 text-[12.5px] font-bold text-white hover:bg-primary-hover"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                title="Cancel"
                aria-label="Cancel delete"
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground-strong"
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>
          ) : (
            <div
              key={preset.id}
              className="group flex items-center gap-1.5 rounded-[9px] px-1 py-1 hover:bg-surface-muted"
            >
              <button
                type="button"
                onClick={() => closeAnd(() => onApply(preset))}
                aria-label={`Apply ${preset.name}`}
                className="min-w-0 flex-1 rounded-lg px-1.5 py-1.5 text-left"
              >
                <div className="truncate text-[13.5px] font-semibold text-navy">
                  {preset.name}
                </div>
                <div className="truncate text-[11.5px] text-muted-foreground">{preset.url}</div>
              </button>
              <button
                type="button"
                title="Edit"
                aria-label={`Edit ${preset.name}`}
                onClick={() => closeAnd(() => onEdit(preset))}
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg text-muted-foreground-strong hover:bg-surface-subtle"
              >
                <Pencil size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="Delete"
                aria-label={`Delete ${preset.name}`}
                onClick={() => setDeletingId(preset.id)}
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-surface-subtle"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          ),
        )}

        <div className="my-1.5 h-px bg-border" />

        <button
          type="button"
          onClick={() => closeAnd(onSaveCurrent)}
          className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2.25 text-[13.5px] font-semibold text-primary"
        >
          <Plus size={16} strokeWidth={2.2} />
          Save current as target
        </button>
      </PopoverContent>
    </Popover>
  );
}
