/** Minimal types for the WebMCP API (https://developer.chrome.com/docs/ai/webmcp). */

interface ModelContextToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  execute: (params: Record<string, string>) => Promise<string> | string;
}

interface ModelContextRegisterToolOptions {
  signal?: AbortSignal;
}

interface ModelContext {
  registerTool: (
    tool: ModelContextToolDefinition,
    options?: ModelContextRegisterToolOptions,
  ) => Promise<void> | void;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

export type { ModelContextToolDefinition };
