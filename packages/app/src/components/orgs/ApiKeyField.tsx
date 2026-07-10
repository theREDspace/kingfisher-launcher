import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ApiKeyFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyField({ value, onChange }: ApiKeyFieldProps) {
  const inputId = useId();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — surfacing
      // the copied checkmark only when it actually succeeds is enough here.
      return;
    }
    setCopied(true);
    clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.75 block text-[13px] font-semibold text-navy">
        API Key
      </label>
      <div className="relative">
        <Input
          id={inputId}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk_live_••••••••••••"
          className="h-11 rounded-control border-border pr-21 pl-3.5 text-sm tabular-nums"
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-0.5">
          <button
            type="button"
            title={revealed ? "Hide API key" : "Show API key"}
            aria-label={revealed ? "Hide API key" : "Show API key"}
            onClick={() => setRevealed((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground-strong"
          >
            {revealed ? (
              <EyeOff size={16} strokeWidth={2} />
            ) : (
              <Eye size={16} strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            title={copied ? "Copied" : "Copy API key"}
            aria-label={copied ? "Copied" : "Copy API key"}
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground-strong"
          >
            {copied ? (
              <Check className="text-success-foreground" size={16} strokeWidth={2.4} />
            ) : (
              <Copy size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
      <div className="mt-1.5 text-[11.5px] text-muted-foreground">
        Stored securely. Reveal or copy as needed.
      </div>
    </div>
  );
}
