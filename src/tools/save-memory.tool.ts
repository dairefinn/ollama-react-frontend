import { BuiltInTool } from "./tool.types";

const MEMORIES_KEY = 'ollama-memories';

export const saveMemoryTool: BuiltInTool = {
    friendlyName: "Save memory",
    definition: {
        type: "function",
        function: {
            name: "save_memory",
            description: "Save something to remember for later. Use this when the user asks you to remember something or when you want to retain important information.",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Short title for the memory" },
                    content: { type: "string", description: "The content to save" }
                },
                required: ["title", "content"]
            }
        }
    },
    execute: ({ title, content }) => {
        const t = title as string;
        const c = content as string;
        try {
            const memories = JSON.parse(localStorage.getItem(MEMORIES_KEY) || '[]');
            memories.push({ id: crypto.randomUUID(), title: t, content: c, timestamp: new Date().toISOString() });
            localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
        } catch {
            return `Failed to save memory: "${t}"`;
        }
        return `Memory saved: "${t}"`;
    }
};
