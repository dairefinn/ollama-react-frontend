import { useState, useEffect } from "react";
import { readStorageFile, writeStorageFile } from "./fs-storage";

export type Memory = {
    id: string;
    title: string;
    content: string;
    timestamp: string;
};

export function useMemoryStorage(): [Memory[], (title: string, content: string) => Promise<void>, (id: string) => Promise<void>] {
    const [memories, setMemories] = useState<Memory[]>([]);

    useEffect(() => {
        readStorageFile('memories.json').then(content => {
            if (content) {
                try { setMemories(JSON.parse(content)); } catch { /* ignore */ }
            }
        });
    }, []);

    async function addMemory(title: string, content: string): Promise<void> {
        const existing = await readStorageFile('memories.json');
        const current: Memory[] = existing ? JSON.parse(existing) : [];
        const updated = [...current, {
            id: crypto.randomUUID(),
            title,
            content,
            timestamp: new Date().toISOString(),
        }];
        await writeStorageFile('memories.json', JSON.stringify(updated));
        setMemories(updated);
    }

    async function deleteMemory(id: string): Promise<void> {
        const existing = await readStorageFile('memories.json');
        const current: Memory[] = existing ? JSON.parse(existing) : [];
        const updated = current.filter(m => m.id !== id);
        await writeStorageFile('memories.json', JSON.stringify(updated));
        setMemories(updated);
    }

    return [memories, addMemory, deleteMemory];
}
