import { BuiltInTool } from "./tool.types";
import { readStorageFile, writeStorageFile } from "../utils/fs-storage";

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
    renderLabel: ({ title }) => `Saving memory: "${String(title)}"`,
    execute: async ({ title, content }) => {
        const t = title as string;
        const c = content as string;
        try {
            const existing = await readStorageFile('memories.json');
            const memories = existing ? JSON.parse(existing) : [];
            memories.push({ id: crypto.randomUUID(), title: t, content: c, timestamp: new Date().toISOString() });
            await writeStorageFile('memories.json', JSON.stringify(memories));
        } catch {
            return `Failed to save memory: "${t}"`;
        }
        return `Memory saved: "${t}"`;
    }
};
