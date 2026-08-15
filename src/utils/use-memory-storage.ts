import { useState } from "react";

export type Memory = {
    id: string;
    title: string;
    content: string;
    timestamp: string;
};

const STORAGE_KEY = 'ollama-memories';

function readMemories(): Memory[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function useMemoryStorage(): [Memory[], (title: string, content: string) => void, (id: string) => void] {
    const [memories, setMemories] = useState<Memory[]>(readMemories);

    function addMemory(title: string, content: string): void {
        const newMemory: Memory = {
            id: crypto.randomUUID(),
            title,
            content,
            timestamp: new Date().toISOString(),
        };
        const updated = [...memories, newMemory];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setMemories(updated);
    }

    function deleteMemory(id: string): void {
        const updated = memories.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setMemories(updated);
    }

    return [memories, addMemory, deleteMemory];
}
