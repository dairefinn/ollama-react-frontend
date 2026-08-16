import { BuiltInTool } from "./tool.types";

type DirEntry = { name: string; isDirectory: boolean };

export const listDirectoryTool: BuiltInTool = {
    friendlyName: "List directory",
    fsPermission: 'read',
    definition: {
        type: "function",
        function: {
            name: "list_directory",
            description: "List the files and subdirectories at a given path on the local filesystem. Only paths within the user's configured allowlist can be accessed.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute path to the directory to list" }
                },
                required: ["path"]
            }
        }
    },
    renderLabel: ({ path }) => `Listing files in ${String(path)}`,
    execute: async ({ path }) => {
        try {
            const res = await fetch(`/api/fs/list?path=${encodeURIComponent(path as string)}`);
            const data = await res.json() as { entries?: DirEntry[]; error?: string };
            if (!res.ok || data.error) return `Error listing directory: ${data.error ?? res.statusText}`;
            if (!data.entries?.length) return 'Directory is empty.';
            return data.entries.map(e => `${e.isDirectory ? '[DIR] ' : '      '}${e.name}`).join('\n');
        } catch (e) {
            return `Failed to list directory: ${String(e)}`;
        }
    }
};
