import { useState, useEffect } from 'react';
import { OllamaAPI } from '../api/ollama-api';

export function useAvailableModels() {
    const [models, setModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        OllamaAPI.models()
            .then(setModels)
            .catch(() => setModels([]))
            .finally(() => setLoading(false));
    }, []);

    return { models, loading };
}
