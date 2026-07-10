import { useId, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface PresetFormDraft {
  id?: string;
  name: string;
  url: string;
  appId: string;
}

export interface PresetFormValues {
  name: string;
  url: string;
  appId: string;
}

interface PresetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: PresetFormDraft;
  orgName: string;
  onSave: (id: string | undefined, values: PresetFormValues) => void;
}

export function PresetFormModal({
  open,
  onOpenChange,
  draft,
  orgName,
  onSave,
}: PresetFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[480px] gap-0 rounded-[20px] p-0 shadow-modal ring-0 sm:max-w-[480px]"
      >
        {open && (
          <PresetFormModalBody
            draft={draft}
            orgName={orgName}
            onClose={() => onOpenChange(false)}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PresetFormModalBody({
  draft,
  orgName,
  onClose,
  onSave,
}: {
  draft: PresetFormDraft;
  orgName: string;
  onClose: () => void;
  onSave: (id: string | undefined, values: PresetFormValues) => void;
}) {
  const [form, setForm] = useState(draft);
  const isEditing = Boolean(draft.id);
  const nameId = useId();
  const urlId = useId();
  const appIdId = useId();

  function handleSave() {
    const name = form.name.trim() || "Untitled target";
    onSave(draft.id, { name, url: form.url, appId: form.appId });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-soft px-6.5 pt-5.5 pb-4.5">
        <div>
          <DialogTitle className="text-[18px] font-extrabold tracking-tight text-navy">
            {isEditing ? "Edit launch target" : "New launch target"}
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
            Saved for {orgName}
          </DialogDescription>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          aria-label="Close launch target form"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-surface-muted text-muted-foreground-strong"
        >
          <X size={17} strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-6.5 pt-5 pb-6">
        <div>
          <label htmlFor={nameId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            Target Name
          </label>
          <Input
            id={nameId}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Production Player"
            className="h-11 rounded-control border-border px-3.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor={urlId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            URL
          </label>
          <Input
            id={urlId}
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://app.example.com"
            className="h-11 rounded-control border-border px-3.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor={appIdId} className="mb-1.75 block text-[13px] font-semibold text-navy">
            App ID
          </label>
          <Input
            id={appIdId}
            value={form.appId}
            onChange={(e) => setForm({ ...form, appId: e.target.value })}
            placeholder="com.example.app"
            className="h-11 rounded-control border-border px-3.5 text-sm tabular-nums"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2.25 border-t border-border-soft px-6.5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="h-10.5 rounded-control border border-border bg-white px-4.5 text-sm font-semibold text-navy"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="h-10.5 rounded-control bg-primary px-5 text-sm font-bold text-white shadow-[0_10px_22px_-10px_rgb(235_22_30_/_60%)] hover:bg-primary-hover"
        >
          {isEditing ? "Save changes" : "Save target"}
        </button>
      </div>
    </>
  );
}
