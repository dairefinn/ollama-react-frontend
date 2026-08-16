import { BuiltInTool } from "./tool.types";

export const createDirectoryTool: BuiltInTool = {
    friendlyName: "Create directory",
    fsPermission: 'write',
    definition: {
        type: "function",
        function: {
            name: "create_directory",
            description: "Create a directory (and any missing parent directories) on the local filesystem. Only paths within the user's configured allowlist can be written.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute path of the directory to create" }
                },
                required: ["path"]
            }
        }
    },
    renderLabel: ({ path }) => `Creating directory ${String(path)}`,
    execute: async ({ path }) => {
        try {
            const res = await fetch('/api/fs/mkdir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path as string }),
            });
            const data = await res.json() as { ok?: boolean; error?: string };
            if (!res.ok || data.error) return `Error creating directory: ${data.error ?? res.statusText}`;
            return `Directory created: ${String(path)}`;
        } catch (e) {
            return `Failed to create directory: ${String(e)}`;
        }
    }
};
