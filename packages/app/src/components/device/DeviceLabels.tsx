import { cn } from "@/lib/utils";

interface DeviceLabelsProps {
  labels: string[];
  size?: "sm" | "md";
}

export function DeviceLabels({ labels, size = "md" }: DeviceLabelsProps) {
  const sizing =
    size === "md"
      ? { height: "h-6.5", padding: "px-2.75", text: "text-xs" }
      : { height: "h-5.5", padding: "px-2", text: "text-[11px]" };

  return (
    <div className="flex flex-wrap gap-1.25">
      {labels.map((label) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center rounded-lg border border-border bg-surface-faint font-semibold text-navy",
            sizing.height,
            sizing.padding,
            sizing.text,
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
