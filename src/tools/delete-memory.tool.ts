import { BuiltInTool } from "./tool.types";

const MEMORIES_KEY = 'ollama-memories';

export const deleteMemoryTool: BuiltInTool = {
    friendlyName: "Delete memory",
    definition: {
        type: "function",
        function: {
            name: "delete_memory",
            description: "Delete a specific memory by its id.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "The id of the memory to delete" }
                },
                required: ["id"]
            }
        }
    },
    renderLabel: ({ id }) => `Deleting memory ${String(id)}`,
    execute: async ({ id }) => {
        const targetId = id as string;
        try {
            const memories = JSON.parse(localStorage.getItem(MEMORIES_KEY) || '[]');
            const filtered = memories.filter((m: { id: string }) => m.id !== targetId);
            if (filtered.length === memories.length) {
                return `No memory found with id: "${targetId}"`;
            }
            localStorage.setItem(MEMORIES_KEY, JSON.stringify(filtered));
            return `Memory deleted: "${targetId}"`;
        } catch {
            return `Failed to delete memory: "${targetId}"`;
        }
    }
};
