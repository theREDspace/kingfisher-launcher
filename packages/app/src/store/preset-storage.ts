export interface Preset {
  id: string;
  orgId: string;
  name: string;
  url: string;
  appId: string;
}

const STORAGE_KEY = "comcast-launcher:presets";

function isPreset(value: unknown): value is Preset {
  if (typeof value !== "object" || value === null) return false;
  const preset = value as Record<string, unknown>;
  return (
    typeof preset.id === "string" &&
    typeof preset.orgId === "string" &&
    typeof preset.name === "string" &&
    typeof preset.url === "string" &&
    typeof preset.appId === "string"
  );
}

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isPreset) : [];
  } catch {
    // Corrupt JSON, or localStorage unavailable (private browsing, storage disabled) — start fresh.
    return [];
  }
}

export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Storage full or unavailable — presets stay in memory for this session but won't persist.
  }
}

export function createPresetId(): string {
  return `preset_${Math.random().toString(36).slice(2, 10)}`;
}
