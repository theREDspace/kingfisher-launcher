import { X } from "lucide-react";

interface PanelHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export function PanelHeader({ title, subtitle, onClose }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border-soft px-5 pt-5 pb-4">
      <div>
        <div className="text-[15px] font-extrabold tracking-tight text-navy">{title}</div>
        <div className="mt-px text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        title="Close"
        aria-label={`Close ${title}`}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-surface-muted text-muted-foreground-strong"
      >
        <X size={16} strokeWidth={2.2} />
      </button>
    </div>
  );
}
