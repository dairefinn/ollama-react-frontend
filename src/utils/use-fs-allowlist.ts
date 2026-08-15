import { useState, useEffect, useCallback } from "react";

export type AllowlistEntry = { path: string; permission: 'read' | 'write' };

export function useFsAllowlist() {
    const [allowlist, setAllowlist] = useState<AllowlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/fs/allowlist');
            setAllowlist(await res.json() as AllowlistEntry[]);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void refresh(); }, [refresh]);

    const addEntry = async (p: string, permission: 'read' | 'write') => {
        await fetch('/api/fs/allowlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: p, permission }),
        });
        await refresh();
    };

    const updatePermission = async (p: string, permission: 'read' | 'write') => {
        await fetch('/api/fs/allowlist', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: p, permission }),
        });
        await refresh();
    };

    const removeEntry = async (p: string) => {
        await fetch('/api/fs/allowlist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: p }),
        });
        await refresh();
    };

    return { allowlist, loading, error, addEntry, updatePermission, removeEntry };
}
