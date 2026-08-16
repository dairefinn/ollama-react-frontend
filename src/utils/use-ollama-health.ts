import { useState, useEffect } from 'react';
import { OllamaAPI } from '../api/ollama-api';

export type OllamaStatus = 'checking' | 'online' | 'offline';

export function useOllamaHealth(): OllamaStatus {
    const [status, setStatus] = useState<OllamaStatus>('checking');

    useEffect(() => {
        let cancelled = false;

        async function check() {
            try {
                await OllamaAPI.models();
                if (!cancelled) setStatus('online');
            } catch {
                if (!cancelled) setStatus('offline');
            }
        }

        check();
        const interval = setInterval(check, 15000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    return status;
}
