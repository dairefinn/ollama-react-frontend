export function validatePrompt(prompt: string): void {
    if (!prompt || prompt.length === 0)
    {
        throw new Error("Prompt cannot be empty");
    }

    if (prompt.length > 2048)
    {
        throw new Error("Prompt cannot be longer than 2048 characters");
    }
}
