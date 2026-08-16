import { BuiltInTool } from "./tool.types";

export const readFileTool: BuiltInTool = {
    friendlyName: "Read file",
    fsPermission: 'read',
    definition: {
        type: "function",
        function: {
            name: "read_file",
            description: "Read the text contents of a file from the local filesystem. Only files within the user's configured allowlist can be accessed.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute path to the file to read" }
                },
                required: ["path"]
            }
        }
    },
    renderLabel: ({ path }) => `Reading ${String(path)}`,
    execute: async ({ path }) => {
        try {
            const res = await fetch(`/api/fs/read?path=${encodeURIComponent(path as string)}`);
            const data = await res.json() as { content?: string; error?: string };
            if (!res.ok || data.error) return `Error reading file: ${data.error ?? res.statusText}`;
            return data.content ?? '';
        } catch (e) {
            return `Failed to read file: ${String(e)}`;
        }
    }
};
