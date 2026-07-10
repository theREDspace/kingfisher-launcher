import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deduplicateImport, pickOrgJsonFile } from "@/lib/import-org";
import type { Org } from "@/store/org-storage";
import type { Preset } from "@/store/preset-storage";

describe("deduplicateImport", () => {
  const existingOrgs: Org[] = [
    { id: "org_1", name: "Acme", orgId: "ACME-001", apiKey: "key-1" },
  ];
  const existingPresets: Preset[] = [
    { id: "preset_1", orgId: "org_1", name: "Prod", url: "https://a.example.com", appId: "app-1" },
  ];

  it("returns orgToAdd: null and the matched org id when the org already exists by orgId", () => {
    const result = {
      org: { name: "Acme Renamed", orgId: "ACME-001", apiKey: "key-1-updated" },
      presets: [] as { name: string; url: string; appId: string }[],
    };
    const { orgToAdd, matchedOrgId } = deduplicateImport(result, existingOrgs, existingPresets);
    expect(orgToAdd).toBeNull();
    expect(matchedOrgId).toBe("org_1");
  });

  it("filters out presets matching an existing org+url+appId combo", () => {
    const result = {
      org: { name: "Acme Renamed", orgId: "ACME-001", apiKey: "key-1" },
      presets: [
        { name: "Duplicate", url: "https://a.example.com", appId: "app-1" },
        { name: "Unique", url: "https://c.example.com", appId: "app-3" },
      ],
    };
    const { presetsToAdd } = deduplicateImport(result, existingOrgs, existingPresets);
    expect(presetsToAdd).toEqual([{ name: "Unique", url: "https://c.example.com", appId: "app-3" }]);
  });
});

describe("pickOrgJsonFile", () => {
  let createdInput: HTMLInputElement | null = null;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createdInput = null;
    const realCreateElement = document.createElement.bind(document);
    createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = realCreateElement(tagName);
      if (tagName === "input") {
        createdInput = el as HTMLInputElement;
        (el as HTMLInputElement).click = vi.fn();
      }
      return el;
    });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    vi.restoreAllMocks();
  });

  function selectFile(file: File) {
    Object.defineProperty(createdInput, "files", { value: [file], configurable: true });
    createdInput!.onchange!(new Event("change"));
  }

  function mockReaderResult(result: string) {
    vi.spyOn(FileReader.prototype, "readAsText").mockImplementation(function (this: FileReader) {
      Object.defineProperty(this, "result", { value: result, configurable: true });
      this.onload?.(new Event("load") as unknown as ProgressEvent<FileReader>);
    });
  }

  it("resolves null when the selected file contains malformed JSON (regression)", async () => {
    mockReaderResult("{ not valid json ");
    const file = new File(["{ not valid json "], "org.json", { type: "application/json" });

    const promise = pickOrgJsonFile();
    selectFile(file);

    await expect(promise).resolves.toBeNull();
  });

  it("resolves the parsed org and presets for valid JSON", async () => {
    const payload = {
      name: "Acme Media Group",
      orgId: "ACME-001",
      apiKey: "sk_live_abc",
      presets: [{ name: "Prod", url: "https://a.example.com", appId: "app-1" }],
    };
    mockReaderResult(JSON.stringify(payload));
    const file = new File([JSON.stringify(payload)], "acme.json", { type: "application/json" });

    const promise = pickOrgJsonFile();
    selectFile(file);

    await expect(promise).resolves.toEqual({
      org: { name: "Acme Media Group", orgId: "ACME-001", apiKey: "sk_live_abc", baseUrl: undefined },
      presets: [{ name: "Prod", url: "https://a.example.com", appId: "app-1" }],
    });
  });
});
