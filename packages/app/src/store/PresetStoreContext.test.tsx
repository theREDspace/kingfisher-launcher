import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PresetStoreProvider, usePresetStore, type PresetInput } from "@/store/PresetStoreContext";

const presetInputA: PresetInput = {
  orgId: "org_1",
  name: "Staging",
  url: "https://staging.example.com",
  appId: "app-staging",
};

beforeEach(() => {
  localStorage.clear();
});

describe("PresetStoreProvider / usePresetStore", () => {
  it("addPreset adds a preset, deletePreset removes it", () => {
    const { result } = renderHook(() => usePresetStore(), { wrapper: PresetStoreProvider });

    let created: ReturnType<typeof result.current.addPreset>;
    act(() => {
      created = result.current.addPreset(presetInputA);
    });
    expect(result.current.presets).toHaveLength(1);

    act(() => {
      result.current.deletePreset(created!.id);
    });
    expect(result.current.presets).toHaveLength(0);
  });
});
