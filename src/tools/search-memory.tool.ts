import { BuiltInTool } from "./tool.types";

const MEMORIES_KEY = 'ollama-memories';

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
    renderLabel: ({ query }) => `Searching memories for "${String(query)}"`,
    execute: async ({ query }) => {
        const q = (query as string).toLowerCase();
        try {
            const memories: { id: string; title: string; content: string }[] =
                JSON.parse(localStorage.getItem(MEMORIES_KEY) || '[]');
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
