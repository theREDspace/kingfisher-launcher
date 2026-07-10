import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EdgeToggleTabProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  onClick: () => void;
}

export function EdgeToggleTab({
  side,
  label,
  open,
  onClick,
}: EdgeToggleTabProps) {
  const Chevron = side === "right" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${open ? "Collapse" : "Expand"} ${label} panel`}
      aria-expanded={open}
      className={cn(
        " pointer-events-auto relative z-2 flex h-22 w-7.5 flex-col items-center justify-center gap-2 border border-border bg-white text-navy shadow-[0_0_24px_-14px_rgb(31_43_50_/_35%)]",
        side === "right"
          ? "rounded-l-xl border-r-0"
          : "rounded-r-xl border-l-0",
      )}
    >
      <Chevron
        className={cn(
          "text-red-600 transition-transform duration-300 ",
          open && "rotate-180",
        )}
        size={16}
        strokeWidth={2.2}
      />
      <span className="text-red-600 text-[10.5px] font-bold tracking-[0.14em] text-muted-foreground uppercase [writing-mode:vertical-rl]">
        {label}
      </span>
    </button>
  );
}
