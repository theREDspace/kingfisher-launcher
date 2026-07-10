import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPresetId, loadPresets, savePresets, type Preset } from "@/store/preset-storage";

export interface PresetInput {
  orgId: string;
  name: string;
  url: string;
  appId: string;
}

interface PresetStoreValue {
  presets: Preset[];
  addPreset: (input: PresetInput) => Preset;
  updatePreset: (id: string, input: PresetInput) => void;
  deletePreset: (id: string) => void;
}

const PresetStoreContext = createContext<PresetStoreValue | null>(null);

export function PresetStoreProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets());

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  const value = useMemo<PresetStoreValue>(
    () => ({
      presets,
      addPreset: (input) => {
        const preset: Preset = { id: createPresetId(), ...input };
        setPresets((prev) => [...prev, preset]);
        return preset;
      },
      updatePreset: (id, input) => {
        setPresets((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)));
      },
      deletePreset: (id) => {
        setPresets((prev) => prev.filter((p) => p.id !== id));
      },
    }),
    [presets],
  );

  return <PresetStoreContext.Provider value={value}>{children}</PresetStoreContext.Provider>;
}

export function usePresetStore(): PresetStoreValue {
  const ctx = useContext(PresetStoreContext);
  if (!ctx) throw new Error("usePresetStore must be used within a PresetStoreProvider");
  return ctx;
}
