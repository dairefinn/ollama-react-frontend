import { BuiltInTool } from "./tool.types";
import { readStorageFile } from "../utils/fs-storage";

export const readMemoryTool: BuiltInTool = {
    friendlyName: "Read memory",
    definition: {
        type: "function",
        function: {
            name: "read_memory",
            description: "Read a specific memory by its id. Use search_memory first to find the id.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "The id of the memory to read" }
                },
                required: ["id"]
            }
        }
    },
    renderLabel: ({ id }) => `Reading memory ${String(id)}`,
    execute: async ({ id }) => {
        try {
            const existing = await readStorageFile('memories.json');
            const memories: { id: string; title: string; content: string; timestamp: string }[] =
                existing ? JSON.parse(existing) : [];
            const memory = memories.find(m => m.id === (id as string));
            if (!memory) return `No memory found with id: "${id}"`;
            return JSON.stringify(memory, null, 2);
        } catch {
            return "Failed to read memory.";
        }
    }
};
