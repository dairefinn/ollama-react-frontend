interface OllamaModelEntry {
    name: string;
}

interface OllamaTagsResponse {
    models: OllamaModelEntry[];
}

export const queryGetModels = (baseUrl: string) => async (): Promise<string[]> => {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);
    const data: OllamaTagsResponse = await response.json();
    return data.models.map(m => m.name);
};
