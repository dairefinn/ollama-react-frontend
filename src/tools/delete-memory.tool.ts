import { BuiltInTool } from "./tool.types";
import { readStorageFile, writeStorageFile } from "../utils/fs-storage";

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
            const existing = await readStorageFile('memories.json');
            const memories = existing ? JSON.parse(existing) : [];
            const filtered = memories.filter((m: { id: string }) => m.id !== targetId);
            if (filtered.length === memories.length) {
                return `No memory found with id: "${targetId}"`;
            }
            await writeStorageFile('memories.json', JSON.stringify(filtered));
            return `Memory deleted: "${targetId}"`;
        } catch {
            return `Failed to delete memory: "${targetId}"`;
        }
    }
};
