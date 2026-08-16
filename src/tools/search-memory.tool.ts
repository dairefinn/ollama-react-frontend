import { BuiltInTool } from "./tool.types";
import { readStorageFile } from "../utils/fs-storage";

export const searchMemoryTool: BuiltInTool = {
    friendlyName: "Search memory",
    definition: {
        type: "function",
        function: {
            name: "search_memory",
            description: "Search saved memories by keyword. Returns matching memories with their id, title, and content.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Keyword or phrase to search for" }
                },
                required: ["query"]
            }
        }
    },
    renderLabel: ({ query }) => query ? `Recalling memories about ${String(query)}` : `Recalling all memories`,
    execute: async ({ query }) => {
        const q = (query as string).toLowerCase();
        try {
            const existing = await readStorageFile('memories.json');
            const memories: { id: string; title: string; content: string }[] =
                existing ? JSON.parse(existing) : [];
            const matches = memories.filter(
                m => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
            );
            if (matches.length === 0) return `No memories found matching: "${query}"`;
            return JSON.stringify(matches.map(({ id, title, content }) => ({ id, title, content })), null, 2);
        } catch {
            return "Failed to search memories.";
        }
    }
};
