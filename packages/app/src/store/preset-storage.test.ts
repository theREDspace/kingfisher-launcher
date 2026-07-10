import { beforeEach, describe, expect, it } from "vitest";
import { loadPresets, savePresets, type Preset } from "@/store/preset-storage";

beforeEach(() => {
  localStorage.clear();
});

describe("preset-storage", () => {
  it("round-trips saved presets", () => {
    const presets: Preset[] = [
      { id: "preset_1", orgId: "org_1", name: "Staging", url: "https://example.com", appId: "app-123" },
    ];
    savePresets(presets);
    expect(loadPresets()).toEqual(presets);
  });

  it("falls back to an empty array on corrupt JSON", () => {
    localStorage.setItem("comcast-launcher:presets", "not json{{{");
    expect(loadPresets()).toEqual([]);
  });
});
