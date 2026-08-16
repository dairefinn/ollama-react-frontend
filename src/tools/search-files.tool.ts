import { BuiltInTool } from "./tool.types";

export const searchFilesTool: BuiltInTool = {
    friendlyName: "Search files",
    fsPermission: 'read',
    definition: {
        type: "function",
        function: {
            name: "search_files",
            description: "Recursively search for files whose names match a pattern within a directory. Supports wildcards: * matches any characters, ? matches one character. Only paths within the user's configured allowlist can be accessed.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute path to the directory to search within" },
                    pattern: { type: "string", description: "Filename pattern, e.g. *.ts, config*, README.md" }
                },
                required: ["path", "pattern"]
            }
        }
    },
    renderLabel: ({ path, pattern }) => `Searching ${String(path)} for "${String(pattern)}"`,
    execute: async ({ path, pattern }) => {
        try {
            const params = new URLSearchParams({ path: path as string, pattern: pattern as string });
            const res = await fetch(`/api/fs/search?${params.toString()}`);
            const data = await res.json() as { matches?: string[]; error?: string };
            if (!res.ok || data.error) return `Error searching files: ${data.error ?? res.statusText}`;
            if (!data.matches?.length) return `No files found matching "${String(pattern)}" in ${String(path)}`;
            return data.matches.join('\n');
        } catch (e) {
            return `Failed to search files: ${String(e)}`;
        }
    }
};
