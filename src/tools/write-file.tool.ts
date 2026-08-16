import { BuiltInTool } from "./tool.types";

export const writeFileTool: BuiltInTool = {
    friendlyName: "Write file",
    fsPermission: 'write',
    definition: {
        type: "function",
        function: {
            name: "write_file",
            description: "Write text content to a file on the local filesystem, creating it if it does not exist or overwriting it if it does. Only paths within the user's configured allowlist can be written.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute path to the file to write" },
                    content: { type: "string", description: "The text content to write to the file" }
                },
                required: ["path", "content"]
            }
        }
    },
    renderLabel: ({ path }) => `Writing ${String(path)}`,
    execute: async ({ path, content }) => {
        try {
            const res = await fetch('/api/fs/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path as string, content: content as string }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok || data.error) return `Error writing file: ${data.error ?? res.statusText}`;
            return `File written: ${String(path)}`;
        } catch (e) {
            return `Failed to write file: ${String(e)}`;
        }
    }
};
